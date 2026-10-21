"use client";

import { useRef, useState } from "react";
import { KeyRound, Code, SlidersHorizontal, Lock, AppWindow, ChevronRight, ShieldCheck } from "lucide-react";
import type { Finding, FindingCategory } from "@/features/scan";
import type { ScanReport } from "@/features/scan/report";
import { CATEGORY_COLOR, CATEGORY_ORDER, SEVERITY_COLOR } from "@/lib/ui";
import { SeverityBadge } from "./SeverityBadge";
import { FindingDrawer } from "./FindingDrawer";

const CATEGORY_ICON: Record<FindingCategory, typeof KeyRound> = {
  Segredo: KeyRound,
  Código: Code,
  Configuração: SlidersHorizontal,
  Autorização: Lock,
  Aplicativo: AppWindow,
};

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
        <code className="vg-mono hidden max-w-[150px] truncate rounded px-2 py-0.5 sm:inline-block" style={{ fontSize: 12, background: "var(--evidence-bg)", color: "var(--evidence-text)" }}>
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="vg-focusable flex w-full items-center gap-3 px-4 py-3 text-left"
      >
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

export function ResultsPanel({ report, summaryNote, emptyNote }: { report: ScanReport; summaryNote: string; emptyNote: string }) {
  const [selected, setSelected] = useState<Finding | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  function select(f: Finding, el: HTMLElement) {
    triggerRef.current = el;
    setSelected(f);
  }
  function close() {
    setSelected(null);
    triggerRef.current?.focus();
  }

  if (report.total === 0) {
    return (
      <div className="vg-card flex flex-col items-center gap-2 p-8 text-center">
        <ShieldCheck size={56} color="var(--success)" />
        <p style={{ fontSize: 16, fontWeight: 600 }}>Nenhum achado nesta verificação.</p>
        <p style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: "52ch" }}>{emptyNote}</p>
      </div>
    );
  }

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: report.findings.filter((f) => f.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="vg-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-5 py-4" style={{ background: "var(--card2)", borderBottom: "1px solid var(--border)" }}>
        <strong style={{ fontSize: 15 }}>{report.total} achado(s)</strong>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{summaryNote}</span>
      </div>
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        {groups.map((g) => (
          <CategoryGroup key={g.category} category={g.category} items={g.items} onSelect={select} />
        ))}
      </div>
      <FindingDrawer finding={selected} onClose={close} />
    </div>
  );
}
