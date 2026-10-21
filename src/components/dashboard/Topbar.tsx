"use client";

import { useState } from "react";
import { Sun, Moon, ShieldCheck, Menu } from "lucide-react";

// Lê o tema já aplicado ao <html> pelo script inline (evita setState em effect).
function readTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function Topbar({ onMenu }: { onMenu?: () => void }) {
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
    <header
      className="sticky top-0 z-10 flex items-center gap-3 px-6 py-[14px]"
      style={{ background: "var(--topbar)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(10px)" }}
    >
      {onMenu && (
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={onMenu}
          className="vg-focusable flex h-11 w-11 items-center justify-center rounded-[10px] md:hidden"
          style={{ color: "var(--text)" }}
        >
          <Menu size={20} />
        </button>
      )}
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} color="var(--teal)" />
        <span style={{ fontWeight: 600 }}>VibeGuard</span>
      </div>
      <div className="ml-auto flex items-center gap-1 rounded-full p-1" style={{ border: "1px solid var(--border)" }}>
        {([
          ["light", Sun],
          ["dark", Moon],
        ] as const).map(([mode, Icon]) => {
          const on = theme === mode;
          return (
            <button
              key={mode}
              type="button"
              aria-pressed={on}
              aria-label={mode === "light" ? "Tema claro" : "Tema escuro"}
              onClick={() => apply(mode)}
              className="vg-focusable flex h-[34px] w-[34px] items-center justify-center rounded-full"
              style={{ background: on ? "var(--teal-soft)" : "transparent", color: on ? "var(--teal)" : "var(--muted)" }}
            >
              <Icon size={17} />
            </button>
          );
        })}
      </div>
    </header>
  );
}
