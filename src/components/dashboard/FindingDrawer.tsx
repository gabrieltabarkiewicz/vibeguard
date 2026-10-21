"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { KeyRound, Code, SlidersHorizontal, Lock, AppWindow, X, Copy, Check } from "lucide-react";
import type { Finding, FindingCategory } from "@/features/scan";
import { CATEGORY_COLOR } from "@/lib/ui";
import { SeverityBadge } from "./SeverityBadge";

const CATEGORY_ICON: Record<FindingCategory, typeof KeyRound> = {
  Segredo: KeyRound,
  Código: Code,
  Configuração: SlidersHorizontal,
  Autorização: Lock,
  Aplicativo: AppWindow,
};

export function FindingDrawer({ finding, onClose }: { finding: Finding | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!finding) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [finding, onClose]);

  if (!finding) return null;
  const Icon = CATEGORY_ICON[finding.category];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" aria-label="Fechar detalhes" className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)", border: "none", cursor: "default" }} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="vg-card relative flex h-full flex-col overflow-y-auto rounded-none"
        style={{ width: "min(460px, 100%)", background: "var(--card)", borderLeft: "1px solid var(--border)" }}
      >
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4"
          style={{ background: "var(--card2)", borderBottom: "1px solid var(--border)" }}
        >
          <SeverityBadge severity={finding.severity} />
          <span className="flex items-center gap-1.5" style={{ fontSize: 13.5, color: "var(--muted)" }}>
            <Icon size={16} color={CATEGORY_COLOR[finding.category]} /> {finding.category}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="vg-focusable ml-auto flex h-10 w-10 items-center justify-center rounded-[10px]"
            style={{ color: "var(--muted)" }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <h2 id={titleId} style={{ fontSize: 20, fontWeight: 600 }}>{finding.title}</h2>

          <dl className="rounded-[12px] p-4" style={{ background: "var(--card2)", border: "1px solid var(--border)" }}>
            <Row label="Localização">
              <span className="vg-mono" style={{ color: "var(--loc)" }}>
                {finding.file}{finding.line > 0 ? `:${finding.line}:${finding.column}` : ""}
              </span>
            </Row>
            <Row label="Evidência">
              <code className="vg-mono rounded px-2 py-1" style={{ fontSize: 12.5, background: "var(--evidence-bg)", color: "var(--evidence-text)" }}>
                {finding.evidence}
              </code>
              {finding.category === "Segredo" && (
                <span className="ml-2" style={{ fontSize: 12, color: "var(--muted)" }}>valor mascarado</span>
              )}
            </Row>
          </dl>

          <Section title="O que é">
            <p style={{ fontSize: 14 }}>{finding.explanation}</p>
          </Section>

          <Section title="Como corrigir">
            <p style={{ fontSize: 14, color: "var(--muted)" }}>{finding.fix}</p>
            <div className="mt-3">
              <CopyFix text={finding.fix} />
            </div>
          </Section>

          <p style={{ fontSize: 12, color: "var(--muted)" }}>
            O VibeGuard sugere a correção; ele não altera seus arquivos. Revise antes de aplicar.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-1.5">
      <dt style={{ fontSize: 12.5, color: "var(--muted)", minWidth: 90 }}>{label}</dt>
      <dd className="m-0 flex flex-wrap items-center gap-1" style={{ fontSize: 13 }}>{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2" style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--teal)" }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function CopyFix({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="vg-chip vg-focusable inline-flex items-center gap-1.5 px-3 py-2"
      style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)" }}
      aria-live="polite"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? "Correção copiada" : "Copiar correção"}
    </button>
  );
}
