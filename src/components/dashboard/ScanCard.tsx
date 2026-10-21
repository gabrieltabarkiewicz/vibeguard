"use client";

import { useId } from "react";
import { Folder, Link as LinkIcon, Play, Loader2, TriangleAlert, Info } from "lucide-react";

export function ScanCard({
  stepTitle,
  description,
  label,
  placeholder,
  kind,
  value,
  onChange,
  onSubmit,
  pending,
  otherPending,
  error,
  note,
}: {
  stepTitle: string;
  description: string;
  label: string;
  placeholder: string;
  kind: "code" | "app";
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  pending: boolean;
  otherPending: boolean;
  error: string | null;
  note?: string;
}) {
  const inputId = useId();
  const errId = `${inputId}-err`;
  const Icon = kind === "code" ? Folder : LinkIcon;

  return (
    <form
      className="vg-card flex flex-1 flex-col gap-4 p-[22px]"
      style={{ minWidth: 300, opacity: otherPending ? 0.45 : 1 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 600 }}>{stepTitle}</h3>
        <p className="mt-1" style={{ fontSize: 13.5, color: "var(--muted)" }}>
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} style={{ fontSize: 12.5, fontWeight: 500, color: "var(--muted)" }}>
          {label}
        </label>
        <div className="relative">
          <Icon size={17} color="var(--muted)" className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2" />
          <input
            id={inputId}
            className="vg-input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errId : undefined}
          />
        </div>
        {error && (
          <p id={errId} role="alert" className="flex items-center gap-1.5" style={{ fontSize: 12.5, color: "var(--warn)" }}>
            <TriangleAlert size={14} /> {error}
          </p>
        )}
      </div>

      <button type="submit" className="vg-btn" disabled={pending || value.trim() === ""}>
        {pending ? <Loader2 size={17} className="vg-spin" /> : <Play size={17} />}
        {pending ? (kind === "code" ? "Analisando…" : "Testando…") : kind === "code" ? "Analisar" : "Testar"}
      </button>

      {note && (
        <p className="flex items-start gap-1.5" style={{ fontSize: 12.5, color: "var(--muted)" }}>
          <Info size={14} color="var(--teal)" className="mt-0.5 shrink-0" /> {note}
        </p>
      )}
    </form>
  );
}
