"use client";

import { ShieldCheck, House, Code, Play, FileText } from "lucide-react";

type NavId = "inicio" | "codigo" | "app" | "relatorio";

const NAV: { id: NavId; label: string; Icon: typeof House }[] = [
  { id: "inicio", label: "Início", Icon: House },
  { id: "codigo", label: "Analisar código", Icon: Code },
  { id: "app", label: "Testar app", Icon: Play },
  { id: "relatorio", label: "Relatório", Icon: FileText },
];

export function Sidebar({ active, onNavigate }: { active: NavId; onNavigate: (id: NavId) => void }) {
  return (
    <aside
      className="flex w-[250px] shrink-0 flex-col gap-5 p-6"
      style={{ background: "var(--side)", borderRight: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-3">
        <ShieldCheck size={38} strokeWidth={1.8} color="var(--teal)" className="vg-glow" />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>VibeGuard</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Seu código. Mais seguro.</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={isActive ? "page" : undefined}
              className="vg-focusable flex items-center gap-3 rounded-[10px] px-[14px] py-[11px] text-left"
              style={{
                fontSize: 14.5,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--teal)" : "var(--text)",
                background: isActive ? "var(--teal-soft)" : "transparent",
                border: isActive ? "1px solid var(--teal-line)" : "1px solid transparent",
              }}
            >
              <Icon size={20} color={isActive ? "var(--teal)" : "var(--muted)"} className={isActive ? "vg-glow" : ""} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} color="var(--teal)" />
          <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--teal)" }}>Tudo na sua máquina.</span>
        </div>
        <p className="mt-1" style={{ fontSize: 12.5, color: "var(--muted)" }}>
          Seus dados nunca saem do seu computador.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="vg-glow inline-block h-2 w-2 rounded-full" style={{ background: "var(--teal)" }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--teal)" }}>Local-first</span>
        </div>
      </div>
    </aside>
  );
}

export type { NavId };
