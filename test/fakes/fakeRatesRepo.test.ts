import { describe, expect, it } from "vitest";
import { RATE_KEYS } from "@taka/engine";
import { FakeRatesRepo } from "./fakeRatesRepo";

const NOW = "2026-11-01T10:00:00.000Z";

describe("FakeRatesRepo", () => {
  it("getPublished returns the seed: version 1 with 63 rows", async () => {
    const repo = new FakeRatesRepo();
    const s = await repo.getPublished();
    expect(s.version).toBe(1);
    expect(Object.keys(s.rows)).toHaveLength(63);
    expect(RATE_KEYS).toHaveLength(63);
    expect(await repo.getDraft()).toBeNull();
  });

  it("ensureDraft creates version 2 copied from 1 and is idempotent", async () => {
    const repo = new FakeRatesRepo();
    expect(await repo.ensureDraft(NOW)).toBe(2);
    expect(await repo.ensureDraft(NOW)).toBe(2);
    const draft = await repo.getDraft();
    expect(draft?.version).toBe(2);
    expect(draft?.publishedAt).toBe("2026-11-01");
    expect(draft?.rows).toEqual((await repo.getPublished()).rows);
    const log = await repo.changeLog();
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ action: "create_draft", version: 2 });
  });

  it("updateRow changes only the draft and logs old/new", async () => {
    const repo = new FakeRatesRepo();
    await repo.ensureDraft(NOW);
    const row = await repo.updateRow(2, "inflation_cpi", { value: 0.09, note: "bumped" }, "test edit", NOW);
    expect(row.value).toBe(0.09);
    expect(row.note).toBe("bumped");
    expect((await repo.getDraft())?.rows.inflation_cpi.value).toBe(0.09);
    expect((await repo.getPublished()).rows.inflation_cpi.value).toBe(0.0834);
    const [edit] = await repo.changeLog();
    expect(edit).toMatchObject({ action: "edit", version: 2, key: "inflation_cpi", note: "test edit" });
    expect(JSON.parse(edit.oldValue!).value).toBe(0.0834);
    expect(JSON.parse(edit.newValue!).value).toBe(0.09);
    await expect(repo.updateRow(1, "inflation_cpi", { value: 1 }, null, NOW)).rejects.toThrow(/not a draft/);
  });

  it("publish makes 2 published and 1 superseded; getVersionRows(1) keeps old values", async () => {
    const repo = new FakeRatesRepo();
    await repo.ensureDraft(NOW);
    await repo.updateRow(2, "inflation_cpi", { value: 0.09 }, null, NOW);
    expect(await repo.publish("monthly review", "2026-11-02T00:00:00.000Z", "sajat")).toBe(2);
    const pub = await repo.getPublished();
    expect(pub.version).toBe(2);
    expect(pub.publishedAt).toBe("2026-11-02");
    expect(pub.rows.inflation_cpi.value).toBe(0.09);
    expect(await repo.getDraft()).toBeNull();
    const v1 = await repo.getVersionRows(1);
    expect(v1?.rows.inflation_cpi.value).toBe(0.0834);
    expect(await repo.getVersionRows(3)).toBeNull();
    const [publish] = await repo.changeLog();
    expect(publish).toMatchObject({ action: "publish", version: 2, actor: "sajat", oldValue: "1", newValue: "2", note: "monthly review" });
    await expect(repo.publish(null, NOW, "x")).rejects.toThrow(/No draft/);
  });

  it("discardDraft removes the draft and logs it", async () => {
    const repo = new FakeRatesRepo();
    await repo.ensureDraft(NOW);
    await repo.discardDraft(NOW);
    expect(await repo.getDraft()).toBeNull();
    expect(await repo.getVersionRows(2)).toBeNull();
    expect((await repo.changeLog())[0]).toMatchObject({ action: "discard_draft", version: 2 });
    // A new draft after discard reuses version 2.
    expect(await repo.ensureDraft(NOW)).toBe(2);
  });

  it("changeLog paginates with limit and before", async () => {
    const repo = new FakeRatesRepo();
    await repo.ensureDraft(NOW);
    await repo.updateRow(2, "policy_rate", { value: 0.1 }, null, NOW);
    await repo.updateRow(2, "dps_rate", { value: 0.1 }, null, NOW);
    const page1 = await repo.changeLog(2);
    expect(page1.map((e) => e.id)).toEqual([3, 2]);
    const page2 = await repo.changeLog(2, page1[page1.length - 1].id);
    expect(page2.map((e) => e.id)).toEqual([1]);
  });
});
