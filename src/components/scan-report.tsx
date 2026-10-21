"use client";

import { useState } from "react";
import type { Finding, Severity } from "@/features/scan";
import { SEVERITY_LABEL, SEVERITY_ORDER, type ScanReport } from "@/features/scan/report";

const SEVERITY_STYLE: Record<Severity, string> = {
  critica: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  alta: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  media: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  baixa: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
};

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${SEVERITY_STYLE[severity]}`}>
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      aria-live="polite"
    >
      {copied ? "Copiado!" : "Copiar correção"}
    </button>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={finding.severity} />
        <h3 className="font-semibold">{finding.title}</h3>
      </div>
      <p className="mt-1 font-mono text-sm break-all text-zinc-500">
        {finding.file}{finding.line > 0 ? `:${finding.line}:${finding.column}` : ""} · <span>{finding.evidence}</span>
      </p>
      <p className="mt-2 text-sm">{finding.explanation}</p>
      <div className="mt-3 flex items-start justify-between gap-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{finding.fix}</p>
        <CopyButton text={finding.fix} />
      </div>
    </li>
  );
}

export function ScanReportView({ report, summaryNote, emptyNote }: {
  report: ScanReport;
  /** Contexto curto ao lado da contagem (ex.: "em 12 arquivo(s)"). */
  summaryNote: string;
  /** Mensagem quando nada foi encontrado. */
  emptyNote: string;
}) {
  if (report.total === 0) {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
        <p className="font-medium">Nenhum problema encontrado.</p>
        <p className="mt-1 text-sm">{emptyNote}</p>
      </div>
    );
  }

  const CATEGORY_ORDER = ["Segredo", "Código", "Configuração", "Autorização", "Aplicativo"] as const;
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: report.findings.filter((f) => f.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <strong>{report.total} achado(s)</strong>
        <span className="text-zinc-500">{summaryNote}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {SEVERITY_ORDER.filter((s) => report.countsBySeverity[s] > 0).map((s) => (
          <span key={s} className="flex items-center gap-1 text-xs">
            <SeverityBadge severity={s} /> {report.countsBySeverity[s]}
          </span>
        ))}
      </div>
      {groups.map((group) => (
        <section key={group.category} className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {group.category} ({group.items.length})
          </h2>
          <ul className="mt-2 flex flex-col gap-3">
            {group.items.map((finding, index) => (
              <FindingCard key={`${finding.ruleId}-${finding.file}-${finding.line}-${finding.column}-${index}`} finding={finding} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
