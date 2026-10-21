"use client";

import { useState, type ReactNode } from "react";
import { Sun, Moon, ExternalLink, ShieldCheck, Trash2 } from "lucide-react";

function readTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="vg-card p-5">
      <h3 className="mb-3" style={{ fontSize: 15, fontWeight: 600 }}>{title}</h3>
      {children}
    </div>
  );
}

export function Settings({ hasResult, onClear }: { hasResult: boolean; onClear: () => void }) {
  const [theme, setTheme] = useState<"dark" | "light">(readTheme);

  function apply(next: "dark" | "light") {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("vg-theme", next);
    } catch {
      // armazenamento indisponível: segue só na sessão
    }
  }

  return (
    <div className="flex max-w-[640px] flex-col gap-5">
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Configurações</h2>

      <Section title="Aparência">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 13.5, color: "var(--muted)" }}>Tema</span>
          <div className="flex items-center gap-1 rounded-full p-1" style={{ border: "1px solid var(--border)" }}>
            {([
              ["light", Sun, "Claro"],
              ["dark", Moon, "Escuro"],
            ] as const).map(([mode, Icon, label]) => {
              const on = theme === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={on}
                  onClick={() => apply(mode)}
                  className="vg-focusable flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ fontSize: 13, background: on ? "var(--teal-soft)" : "transparent", color: on ? "var(--teal)" : "var(--muted)" }}
                >
                  <Icon size={15} /> {label}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section title="Como funciona a varredura">
        <ul className="flex flex-col gap-1.5" style={{ fontSize: 13.5, color: "var(--muted)" }}>
          <li>• Lê os arquivos da pasta na sua máquina; nada é enviado para fora.</li>
          <li>• Ignora <span className="vg-mono">node_modules</span>, pastas de build e lockfiles.</li>
          <li>• Pula arquivos binários e arquivos muito grandes (acima de 512 KB).</li>
          <li>• Não lê <span className="vg-mono">.env.local</span> nem arquivos <span className="vg-mono">.local</span>.</li>
          <li>• O teste do app só funciona em endereços locais (localhost) e não é destrutivo.</li>
        </ul>
      </Section>

      <Section title="Dados">
        <p className="mb-3" style={{ fontSize: 13.5, color: "var(--muted)" }}>
          Os resultados ficam só nesta sessão do navegador. Você pode limpá-los quando quiser.
        </p>
        <button
          type="button"
          onClick={onClear}
          disabled={!hasResult}
          className="vg-chip vg-focusable inline-flex items-center gap-2 px-3 py-2"
          style={{ fontSize: 13, color: hasResult ? "var(--warn)" : "var(--muted)" }}
        >
          <Trash2 size={15} /> Limpar resultados
        </button>
      </Section>

      <Section title="Sobre">
        <div className="flex items-center gap-2" style={{ fontSize: 14 }}>
          <ShieldCheck size={18} color="var(--teal)" /> <strong>VibeGuard</strong> <span style={{ color: "var(--muted)" }}>v1.0.0</span>
        </div>
        <p className="mt-2" style={{ fontSize: 13.5, color: "var(--muted)" }}>
          Roda 100% na sua máquina — seus dados nunca saem do seu computador.
        </p>
        <a
          href="https://github.com/gabrieltabarkiewicz/vibeguard"
          target="_blank"
          rel="noreferrer"
          className="vg-focusable mt-3 inline-flex items-center gap-2"
          style={{ fontSize: 13.5, color: "var(--teal)" }}
        >
          <ExternalLink size={15} /> Ver no GitHub
        </a>
      </Section>
    </div>
  );
}
