// A D1Like over Node's built-in SQLite, so D1RatesRepo can be tested against the real migrations.
// `batch` runs its statements in one transaction and rolls back on the first failure, like D1.
import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import type { D1Like, D1ResultLike, D1StatementLike } from "@/lib/server/db";

class SqliteStatement implements D1StatementLike {
  constructor(
    private readonly db: DatabaseSync,
    private readonly query: string,
    private readonly values: SQLInputValue[] = [],
  ) {}

  bind(...values: unknown[]): D1StatementLike {
    return new SqliteStatement(this.db, this.query, values.map(toSqlValue));
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const row = this.db.prepare(this.query).get(...this.values);
    return row === undefined ? null : (plain(row) as T);
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    const rows = this.db.prepare(this.query).all(...this.values);
    return { results: rows.map((r) => plain(r) as T) };
  }

  async run(): Promise<D1ResultLike> {
    const info = this.db.prepare(this.query).run(...this.values);
    return { success: true, meta: { changes: Number(info.changes) } };
  }
}

function toSqlValue(v: unknown): SQLInputValue {
  if (v === undefined) throw new TypeError("bind value must not be undefined (use null)");
  if (v === null || typeof v === "number" || typeof v === "string" || typeof v === "bigint") return v;
  if (v instanceof Uint8Array) return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  throw new TypeError(`unsupported bind value of type ${typeof v}`);
}

/** node:sqlite returns null-prototype objects; copy them so `toEqual` and spreads behave. */
function plain(row: unknown): Record<string, unknown> {
  return { ...(row as Record<string, unknown>) };
}

export class SqliteD1 implements D1Like {
  readonly db: DatabaseSync;

  constructor(filename = ":memory:") {
    this.db = new DatabaseSync(filename);
    this.db.exec("PRAGMA foreign_keys = ON");
  }

  exec(sql: string): void {
    this.db.exec(sql);
  }

  prepare(query: string): D1StatementLike {
    return new SqliteStatement(this.db, query);
  }

  async batch(statements: D1StatementLike[]): Promise<D1ResultLike[]> {
    this.db.exec("BEGIN");
    try {
      const out: D1ResultLike[] = [];
      for (const s of statements) out.push(await s.run());
      this.db.exec("COMMIT");
      return out;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }

  /** Applies the given migration files (relative to the repo's migrations/ folder) in order. */
  migrate(...files: string[]): this {
    const dir = path.join(process.cwd(), "migrations");
    for (const f of files) this.db.exec(readFileSync(path.join(dir, f), "utf8"));
    return this;
  }
}

/** A fresh in-memory database with the schema and the seeded version 1 applied. */
export function seededSqliteD1(): SqliteD1 {
  return new SqliteD1().migrate("0001_schema.sql", "0002_seed_rates.sql");
}
