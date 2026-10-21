"use client";

import { useId, useRef, useState } from "react";
import { KeyRound, Code, SlidersHorizontal, Lock, AppWindow, ChevronRight, ShieldCheck, Clock } from "lucide-react";
import type { Finding, FindingCategory, Severity } from "@/features/scan";
import type { ScanReport } from "@/features/scan/report";
import { CATEGORY_COLOR, CATEGORY_ORDER, SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/ui";
import { SeverityBadge } from "./SeverityBadge";
import { FindingDrawer } from "./FindingDrawer";
import { OverviewTab } from "./OverviewTab";

const CATEGORY_ICON: Record<FindingCategory, typeof KeyRound> = {
  Segredo: KeyRound,
  Código: Code,
  Configuração: SlidersHorizontal,
  Autorização: Lock,
  Aplicativo: AppWindow,
};
const SEV_ORDER: Severity[] = ["critica", "alta", "media", "baixa"];

function FindingRow({ finding, onSelect }: { finding: Finding; onSelect: (f: Finding, el: HTMLElement) => void }) {
  return (
    <li style={{ borderTop: "1px solid var(--border)" }}>
      <button
        type="button"
        onClick={(e) => onSelect(finding, e.currentTarget)}
        className="vg-focusable flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 text-left hover:bg-[var(--teal-soft)]"
      >
        <span className="h-[18px] w-[3px] shrink-0 rounded" style={{ background: SEVERITY_COLOR[finding.severity] }} />
        <SeverityBadge severity={finding.severity} />
        <span className="min-w-[140px] flex-1" style={{ fontSize: 13.5 }}>{finding.title}</span>
        <span className="vg-mono max-w-[160px] truncate" style={{ fontSize: 12.5, color: "var(--loc)" }}>
          {finding.file}{finding.line > 0 ? `:${finding.line}` : ""}
        </span>
        <code className="vg-mono max-w-[140px] truncate rounded px-2 py-0.5" style={{ fontSize: 12, background: "var(--evidence-bg)", color: "var(--evidence-text)" }}>
          {finding.evidence}
        </code>
        <ChevronRight size={16} color="var(--muted)" className="ml-auto shrink-0" />
      </button>
    </li>
  );
}

function CategoryGroup({ category, items, onSelect }: { category: FindingCategory; items: Finding[]; onSelect: (f: Finding, el: HTMLElement) => void }) {
  const [open, setOpen] = useState(true);
  const Icon = CATEGORY_ICON[category];
  return (
    <div className="rounded-[12px]" style={{ background: "var(--card2)", border: "1px solid var(--border)" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="vg-focusable flex w-full items-center gap-3 px-4 py-3 text-left">
        <Icon size={20} color={CATEGORY_COLOR[category]} />
        <span style={{ fontSize: 15, fontWeight: 600 }}>{category}</span>
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{items.length} achado(s)</span>
        <ChevronRight size={16} color="var(--muted)" className="ml-auto" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
      </button>
      {open && (
        <ul>
          {items.map((f, i) => (
            <FindingRow key={`${f.ruleId}-${f.file}-${f.line}-${i}`} finding={f} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function ResultsPanel({ report, summaryNote, emptyNote, lastRun }: { report: ScanReport; summaryNote: string; emptyNote: string; lastRun: string }) {
  const [tab, setTab] = useState<"findings" | "overview">("findings");
  const [catFilter, setCatFilter] = useState<FindingCategory | null>(null);
  const [sevFilter, setSevFilter] = useState<"all" | Severity>("all");
  const [selected, setSelected] = useState<Finding | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const sevId = useId();

  if (report.total === 0) {
    return (
      <div className="vg-card flex flex-col items-center gap-2 p-8 text-center">
        <ShieldCheck size={56} color="var(--success)" />
        <p style={{ fontSize: 16, fontWeight: 600 }}>Nenhum achado nesta verificação.</p>
        <p style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: "52ch" }}>{emptyNote}</p>
      </div>
    );
  }

  const present = CATEGORY_ORDER.filter((c) => report.findings.some((f) => f.category === c));
  const visible = report.findings.filter(
    (f) => (catFilter === null || f.category === catFilter) && (sevFilter === "all" || f.severity === sevFilter),
  );
  const groups = CATEGORY_ORDER.map((category) => ({ category, items: visible.filter((f) => f.category === category) })).filter((g) => g.items.length > 0);

  function select(f: Finding, el: HTMLElement) {
    triggerRef.current = el;
    setSelected(f);
  }

  return (
    <div className="vg-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-5 pt-3" style={{ background: "var(--card2)", borderBottom: "1px solid var(--border)" }} role="tablist" aria-label="Resultados">
        {(["findings", "overview"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className="vg-focusable px-4 py-2.5"
            style={{ fontSize: 14, fontWeight: 600, color: tab === t ? "var(--teal)" : "var(--muted)", borderBottom: tab === t ? "2px solid var(--teal)" : "2px solid transparent" }}
          >
            {t === "findings" ? "Achados" : "Visão geral"}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1.5" style={{ fontSize: 12, color: "var(--muted)" }}>
          <Clock size={13} /> Última análise: <span className="vg-mono">{lastRun}</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 py-3">
        <strong style={{ fontSize: 15 }}>{report.total} achado(s)</strong>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{summaryNote}</span>
        {tab === "findings" && (
          <label className="ml-auto flex items-center gap-2" style={{ fontSize: 12.5, color: "var(--muted)" }}>
            <span id={sevId}>Severidade</span>
            <select
              aria-labelledby={sevId}
              value={sevFilter}
              onChange={(e) => setSevFilter(e.target.value as "all" | Severity)}
              className="rounded-[8px] px-2 py-1"
              style={{ background: "var(--input)", color: "var(--text)", border: "1px solid var(--border)", fontSize: 12.5 }}
            >
              <option value="all">Todas</option>
              {SEV_ORDER.map((s) => (
                <option key={s} value={s}>{SEVERITY_LABEL[s]}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {tab === "findings" ? (
        <>
          <div className="flex flex-wrap gap-2 px-5 pb-3">
            {present.map((c) => {
              const count = report.findings.filter((f) => f.category === c).length;
              const on = catFilter === c;
              const Icon = CATEGORY_ICON[c];
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCatFilter(on ? null : c)}
                  className="vg-chip vg-focusable flex items-center gap-2 px-3 py-2"
                  style={{ fontSize: 12.5 }}
                >
                  <Icon size={15} color={CATEGORY_COLOR[c]} />
                  {c}
                  <span className="vg-mono rounded-full px-1.5" style={{ fontSize: 11, background: "var(--track)" }}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 p-4 pt-0 sm:p-5 sm:pt-0">
            {groups.map((g) => (
              <CategoryGroup key={g.category} category={g.category} items={g.items} onSelect={select} />
            ))}
          </div>
        </>
      ) : (
        <div className="p-5">
          <OverviewTab findings={report.findings} />
        </div>
      )}

      <FindingDrawer
        finding={selected}
        onClose={() => {
          setSelected(null);
          triggerRef.current?.focus();
        }}
      />
    </div>
  );
}
