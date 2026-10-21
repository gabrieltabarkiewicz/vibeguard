import type { Severity } from "@/features/scan";
import { SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/ui";

const ORDER: Severity[] = ["critica", "alta", "media", "baixa"];
const R = 54;
const C = 2 * Math.PI * R;

export function SummaryDonut({ counts, total }: { counts: Record<Severity, number>; total: number }) {
  const active = ORDER.filter((s) => counts[s] > 0);
  const dashes = active.map((s) => (counts[s] / total) * C);
  const segments = active.map((s, i) => ({
    s,
    dash: dashes[i]!,
    offset: dashes.slice(0, i).reduce((a, b) => a + b, 0),
  }));

  return (
    <div className="flex items-center gap-4">
      <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
        <g transform="rotate(-90 70 70)">
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--track)" strokeWidth="12" />
          {segments.map(({ s, dash, offset: o }) => (
            <circle
              key={s}
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={SEVERITY_COLOR[s]}
              strokeWidth="12"
              strokeDasharray={`${Math.max(dash - 3, 0)} ${C - Math.max(dash - 3, 0)}`}
              strokeDashoffset={-o}
            />
          ))}
        </g>
        <text x="70" y="68" textAnchor="middle" style={{ fontSize: 30, fontWeight: 700, fill: "var(--text)" }}>
          {total}
        </text>
        <text x="70" y="86" textAnchor="middle" style={{ fontSize: 11, fill: "var(--muted)" }}>
          achados
        </text>
      </svg>
      <ul className="flex flex-col gap-1.5">
        {ORDER.map((s) => (
          <li key={s} className="flex items-center gap-2" style={{ fontSize: 12.5 }}>
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: SEVERITY_COLOR[s] }} />
            <span style={{ color: "var(--muted)" }}>{SEVERITY_LABEL[s]}</span>
            <span className="vg-mono ml-auto" style={{ fontWeight: 600 }}>{counts[s]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
