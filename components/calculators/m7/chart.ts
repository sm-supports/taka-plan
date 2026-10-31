/**
 * Geometry for the "how long would my money last" chart (pure, no React). Ages run along x (mirrored
 * in right-to-left locales so time follows the reading direction), the balance up y from zero.
 */
import type { SimulationPoint } from "@taka/engine";

export interface ChartBox {
  width: number;
  height: number;
  /** Space left and right of the plot. */
  padX: number;
  padTop: number;
  padBottom: number;
}

export interface ChartTick {
  age: number;
  x: number;
  /** SVG text-anchor that keeps the label inside the box. */
  anchor: "start" | "middle" | "end";
}

export interface ChartGeometry {
  /** Polyline path of the balance. */
  line: string;
  /** Closed path under the line, down to zero. */
  area: string;
  ticks: ChartTick[];
  /** Largest balance (the y scale's top); at least 1. */
  max: number;
  /** Age at which the balance is highest. */
  peakAge: number;
  /** y of the zero line. */
  baseline: number;
  x: (age: number) => number;
  y: (balance: number) => number;
}

/** Minimum years between two age labels so they never overlap on a phone. */
const MIN_TICK_GAP = 6;

/** Sorted, de-duplicated tick ages inside [first, last]; the two ends always stay. */
export function tickAges(first: number, last: number, marks: readonly number[]): number[] {
  const inside = [...new Set([first, ...marks.filter((a) => a > first && a < last), last])].sort((a, b) => a - b);
  const out: number[] = [];
  for (const a of inside) {
    const prev = out[out.length - 1];
    if (prev === undefined || a - prev >= MIN_TICK_GAP) {
      out.push(a);
      continue;
    }
    // Too close: the last age wins over an inner mark; both ends always stay (anchored start / end).
    if (a === last) {
      if (prev === first) out.push(a);
      else out[out.length - 1] = a;
    }
  }
  return out;
}

function anchorFor(x: number, width: number): ChartTick["anchor"] {
  if (x < width * 0.15) return "start";
  if (x > width * 0.85) return "end";
  return "middle";
}

export function chartGeometry(points: readonly SimulationPoint[], box: ChartBox, opts: { rtl: boolean; marks: readonly number[] }): ChartGeometry {
  const first = points[0]?.age ?? 0;
  const last = points[points.length - 1]?.age ?? first + 1;
  const span = Math.max(1, last - first);
  const plotW = box.width - 2 * box.padX;
  const plotH = box.height - box.padTop - box.padBottom;
  let max = 1;
  let peakAge = first;
  for (const p of points) {
    if (p.balance > max) {
      max = p.balance;
      peakAge = p.age;
    }
  }
  const x = (age: number) => {
    const t = (age - first) / span;
    const ltr = box.padX + t * plotW;
    return opts.rtl ? box.width - ltr : ltr;
  };
  const y = (balance: number) => box.padTop + (1 - Math.max(0, balance) / max) * plotH;
  const baseline = y(0);
  const r = (n: number) => Math.round(n * 10) / 10;
  const coords = points.map((p) => `${r(x(p.age))},${r(y(p.balance))}`);
  const line = coords.length > 0 ? `M${coords.join(" L")}` : "";
  const area = coords.length > 0 ? `M${r(x(first))},${r(baseline)} L${coords.join(" L")} L${r(x(last))},${r(baseline)} Z` : "";
  const ticks = tickAges(first, last, opts.marks).map((age) => {
    const tx = x(age);
    return { age, x: tx, anchor: anchorFor(tx, box.width) };
  });
  return { line, area, ticks, max, peakAge, baseline, x, y };
}
