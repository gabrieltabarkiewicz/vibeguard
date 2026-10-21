import { KeyRound, Code, SlidersHorizontal, Lock, AppWindow } from "lucide-react";
import type { Finding, FindingCategory, Severity } from "@/features/scan";
import { CATEGORY_COLOR, CATEGORY_ORDER, SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/ui";

const SEV_ORDER: Severity[] = ["critica", "alta", "media", "baixa"];
const ICON: Record<FindingCategory, typeof KeyRound> = {
  Segredo: KeyRound,
  Código: Code,
  Configuração: SlidersHorizontal,
  Autorização: Lock,
  Aplicativo: AppWindow,
};

export function OverviewTab({ findings }: { findings: Finding[] }) {
  const rows = CATEGORY_ORDER.map((category) => {
    const items = findings.filter((f) => f.category === category);
    const counts = SEV_ORDER.reduce<Record<Severity, number>>(
      (acc, s) => ({ ...acc, [s]: items.filter((f) => f.severity === s).length }),
      { critica: 0, alta: 0, media: 0, baixa: 0 },
    );
    return { category, total: items.length, counts };
  }).filter((r) => r.total > 0);

  const maxTotal = Math.max(1, ...rows.map((r) => r.total));

  return (
    <div className="flex flex-col gap-4">
      {rows.map(({ category, total, counts }) => {
        const Icon = ICON[category];
        return (
          <div key={category} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Icon size={16} color={CATEGORY_COLOR[category]} />
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{category}</span>
              <span className="ml-auto vg-mono" style={{ fontSize: 12.5, color: "var(--muted)" }}>{total}</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full" style={{ width: `${(total / maxTotal) * 100}%`, minWidth: 24, background: "var(--track)" }}>
              {SEV_ORDER.filter((s) => counts[s] > 0).map((s) => (
                <span key={s} style={{ flex: counts[s], background: SEVERITY_COLOR[s] }} title={`${SEVERITY_LABEL[s]}: ${counts[s]}`} />
              ))}
            </div>
          </div>
        );
      })}
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {SEV_ORDER.map((s) => (
          <li key={s} className="flex items-center gap-1.5" style={{ fontSize: 12, color: "var(--muted)" }}>
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: SEVERITY_COLOR[s] }} />
            {SEVERITY_LABEL[s]}
          </li>
        ))}
      </ul>
    </div>
  );
}
