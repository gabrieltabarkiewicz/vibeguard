"use client";

import { Monitor, Zap, Users } from "lucide-react";

const BENEFITS: { Icon: typeof Monitor; title: string; text: string }[] = [
  { Icon: Monitor, title: "100% local", text: "Nada sai do seu computador." },
  { Icon: Zap, title: "Rápido e simples", text: "Resultados em poucos minutos." },
  { Icon: Users, title: "Para todos", text: "Sem precisar entender de segurança." },
];

export function Hero() {
  return (
    <section
      className="relative overflow-hidden rounded-[16px] p-7"
      style={{
        background: "var(--hero-bg)",
        border: "1px solid var(--teal-line)",
        backgroundImage:
          "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <span className="vg-glow absolute left-0 top-0 h-full w-[3px]" style={{ background: "var(--teal)" }} />
      <div className="flex flex-wrap items-center gap-8">
        <div className="min-w-[260px] flex-1">
          <h1 style={{ fontSize: "clamp(25px, 2.3vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em" }}>
            Mais segurança para o seu app{" "}
            <span style={{ color: "var(--teal)" }}>com IA.</span>
          </h1>
          <p className="mt-3 max-w-[46ch]" style={{ fontSize: 15, color: "var(--muted)" }}>
            O VibeGuard procura brechas no seu projeto — direto na sua máquina — e explica cada uma em
            linguagem simples, com a correção pronta.
          </p>
          <div className="mt-5 flex flex-wrap gap-5">
            {BENEFITS.map(({ Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--teal-soft)" }}
                >
                  <Icon size={17} color="var(--teal)" />
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ShieldArt />
      </div>
    </section>
  );
}

function ShieldArt() {
  return (
    <svg width="210" height="160" viewBox="0 0 260 190" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="vg-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
        <radialGradient id="vg-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--teal)" stopOpacity="0.3" />
          <stop offset="1" stopColor="var(--teal)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="130" cy="150" rx="90" ry="22" fill="url(#vg-floor)" />
      <ellipse cx="130" cy="95" rx="110" ry="42" fill="none" stroke="var(--teal)" strokeOpacity="0.22" strokeDasharray="3 5" />
      <ellipse cx="130" cy="95" rx="86" ry="33" fill="none" stroke="var(--teal)" strokeOpacity="0.45" />
      <ellipse cx="130" cy="95" rx="62" ry="24" fill="none" stroke="var(--cyan)" strokeOpacity="0.55" />
      <g transform="translate(90 40)">
        <path d="M40 0 L80 15 V52 C80 82 62 100 40 108 C18 100 0 82 0 52 V15 Z" fill="url(#vg-shield)" stroke="var(--teal)" strokeWidth="3" />
        <path d="M40 12 L68 23 V52 C68 74 55 88 40 94 C25 88 12 74 12 52 V23 Z" fill="#06202b" opacity="0.45" />
        <path d="M24 54 l12 12 l22 -28" fill="none" stroke="#eafffb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
