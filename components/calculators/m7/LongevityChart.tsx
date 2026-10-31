"use client";
/**
 * "How long would my money last?": the engine's year-by-year balance as an inline SVG line chart.
 * No chart library. role="img" with a one-sentence summary; age labels under the axis; the time
 * axis is mirrored in right-to-left locales. Colours come from the theme (currentColor + classes).
 */
import type { M7Verdict, SimulationPoint } from "@taka/engine";
import { LOCALE_META } from "@/lib/i18n/config";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { chartGeometry, type ChartBox } from "./chart";

const BOX: ChartBox = { width: 340, height: 190, padX: 12, padTop: 26, padBottom: 30 };

export interface LongevityChartProps {
  points: SimulationPoint[];
  retirementAge: number;
  contrastAge: number;
  verdict: M7Verdict;
  /** The verdict sentence ("Runs out at 71"), already translated. */
  verdictText: string;
}

const VERDICT_STROKE: Record<M7Verdict["status"], string> = {
  green: "text-status-green",
  amber: "text-status-amber",
  red: "text-status-red",
};

export function LongevityChart({ points, retirementAge, contrastAge, verdict, verdictText }: LongevityChartProps) {
  const { t, locale } = useT();
  const f = useFormat();
  const rtl = LOCALE_META[locale]?.dir === "rtl";
  const first = points[0]?.age ?? 0;
  const last = points[points.length - 1]?.age ?? first;
  const marks = [retirementAge, contrastAge, ...(verdict.kind === "onTrack" ? [] : [verdict.age])];
  const g = chartGeometry(points, BOX, { rtl, marks });
  const peak = points.find((p) => p.age === g.peakAge)?.balance ?? 0;
  const label = t("m7.result.chart.label", {
    from: f.number(first),
    to: f.number(last),
    peak: f.money(peak, { compact: true }),
    peakAge: f.number(g.peakAge),
    verdict: verdictText,
  });
  const showRetire = retirementAge > first && retirementAge < last;
  const endX = verdict.kind === "onTrack" ? g.x(last) : g.x(verdict.age);
  const endY = verdict.kind === "onTrack" ? g.y(points[points.length - 1]?.balance ?? 0) : g.baseline;
  // The y-scale label sits on the side the time axis starts from.
  const scaleX = rtl ? BOX.width - BOX.padX : BOX.padX;

  return (
    <figure className="m-0" data-testid="m7-chart-figure">
      <svg
        role="img"
        aria-label={label}
        data-testid="m7-chart"
        viewBox={`0 0 ${BOX.width} ${BOX.height}`}
        className="h-auto w-full overflow-visible text-brand-600"
        style={{ direction: "ltr" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <text x={scaleX} y={14} textAnchor={rtl ? "end" : "start"} className="fill-text-muted text-[11px]">
          {f.money(g.max, { compact: true })}
        </text>
        <line x1={BOX.padX} x2={BOX.width - BOX.padX} y1={BOX.padTop} y2={BOX.padTop} className="stroke-line" strokeDasharray="2 4" />
        <line x1={BOX.padX} x2={BOX.width - BOX.padX} y1={g.baseline} y2={g.baseline} className="stroke-line" />
        {showRetire && (
          <g>
            <line x1={g.x(retirementAge)} x2={g.x(retirementAge)} y1={BOX.padTop} y2={g.baseline} className="stroke-text-faint" strokeDasharray="3 3" />
            <text x={g.x(retirementAge)} y={BOX.padTop - 4} textAnchor="middle" className="fill-text-muted text-[10px]">
              {t("m7.result.chart.retire")}
            </text>
          </g>
        )}
        <path d={g.area} fill="currentColor" fillOpacity={0.12} />
        <path d={g.line} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={endX} cy={endY} r={4.5} className={VERDICT_STROKE[verdict.status]} fill="currentColor" />
        {g.ticks.map((tick) => (
          <g key={tick.age}>
            <line x1={tick.x} x2={tick.x} y1={g.baseline} y2={g.baseline + 4} className="stroke-text-faint" />
            <text x={tick.x} y={BOX.height - 8} textAnchor={tick.anchor} className="fill-text-muted text-[11px] tabular-nums">
              {f.number(tick.age)}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-1 text-center text-xs text-text-faint">{t("m7.result.chart.axisAge")}</figcaption>
    </figure>
  );
}
