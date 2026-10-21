"use client";

import { useState } from "react";
import { KeyRound, Code, SlidersHorizontal, Lock, AppWindow, ChevronRight, Copy, Check, ShieldCheck } from "lucide-react";
import type { Finding, FindingCategory } from "@/features/scan";
import type { ScanReport } from "@/features/scan/report";
import { CATEGORY_COLOR, CATEGORY_ORDER, SEVERITY_COLOR } from "@/lib/ui";
import { SeverityBadge } from "./SeverityBadge";

const CATEGORY_ICON: Record<FindingCategory, typeof KeyRound> = {
  Segredo: KeyRound,
  Código: Code,
  Configuração: SlidersHorizontal,
  Autorização: Lock,
  Aplicativo: AppWindow,
};

function CopyFix({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="vg-chip vg-focusable inline-flex items-center gap-1.5 px-3 py-1.5"
      style={{ fontSize: 12.5, fontWeight: 600, color: "var(--teal)" }}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        } catch {
          setCopied(false);
        }
      }}
      aria-live="polite"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Correção copiada" : "Copiar correção"}
    </button>
  );
}

function FindingItem({ finding }: { finding: Finding }) {
  const [open, setOpen] = useState(false);
  return (
    <li style={{ borderTop: "1px solid var(--border)" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="vg-focusable flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left"
      >
        <span className="h-[18px] w-[3px] shrink-0 rounded" style={{ background: SEVERITY_COLOR[finding.severity] }} />
        <SeverityBadge severity={finding.severity} />
        <span className="flex-1" style={{ fontSize: 13.5, minWidth: 160 }}>{finding.title}</span>
        <span className="vg-mono truncate" style={{ fontSize: 12.5, color: "var(--loc)", maxWidth: 180 }}>
          {finding.file}{finding.line > 0 ? `:${finding.line}` : ""}
        </span>
        <ChevronRight size={16} color="var(--muted)" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
      </button>
      {open && (
        <div className="px-4 pb-4" style={{ marginLeft: 12 }}>
          <code
            className="vg-mono mb-3 inline-block max-w-full truncate rounded px-2 py-1"
            style={{ fontSize: 12, background: "var(--evidence-bg)", color: "var(--evidence-text)" }}
          >
            {finding.evidence}
          </code>
          <p style={{ fontSize: 13.5 }}>{finding.explanation}</p>
          <p className="mt-2" style={{ fontSize: 13.5, color: "var(--muted)" }}>{finding.fix}</p>
          <div className="mt-3">
            <CopyFix text={finding.fix} />
          </div>
        </div>
      )}
    </li>
  );
}

function CategoryGroup({ category, items }: { category: FindingCategory; items: Finding[] }) {
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
            <FindingItem key={`${f.ruleId}-${f.file}-${f.line}-${i}`} finding={f} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function ResultsPanel({ report, summaryNote, emptyNote }: { report: ScanReport; summaryNote: string; emptyNote: string }) {
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
      <div className="flex flex-col gap-3 p-5">
        {groups.map((g) => (
          <CategoryGroup key={g.category} category={g.category} items={g.items} />
        ))}
      </div>
    </div>
  );
}
