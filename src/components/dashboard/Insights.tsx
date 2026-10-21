"use client";

import type { ReactNode } from "react";
import { CircleCheck, Info, KeyRound, SlidersHorizontal, Lock, ShieldCheck, TriangleAlert } from "lucide-react";
import type { ScanReport } from "@/features/scan/report";
import { SummaryDonut } from "./SummaryDonut";

const TIPS: { Icon: typeof KeyRound; color: string; title: string; text: string }[] = [
  { Icon: KeyRound, color: "var(--cat-secret)", title: "Segredos", text: "Chaves nunca devem ficar no código: use variáveis de ambiente." },
  { Icon: SlidersHorizontal, color: "var(--cat-config)", title: "Configuração", text: "Feche o CORS e ligue os cabeçalhos de segurança." },
  { Icon: Lock, color: "var(--cat-auth)", title: "Autorização", text: "Confirme no servidor quem pode acessar cada recurso." },
];

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="vg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-[22px] w-[3px] rounded" style={{ background: "var(--teal)" }} />
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function Insights({
  state,
  report,
  target,
}: {
  state: "idle" | "has" | "empty" | "error";
  report: ScanReport | null;
  target: string | null;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Panel title="Resumo do relatório">
        {report && report.total > 0 ? (
          <SummaryDonut counts={report.countsBySeverity} total={report.total} />
        ) : (
          <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
            Rode uma análise para ver o resumo por severidade.
          </p>
        )}
      </Panel>

      <div className="vg-card p-5" style={{ border: "1px solid var(--teal-line)" }}>
        {state === "has" && report && (
          <div className="flex items-start gap-3">
            <CircleCheck size={40} color="var(--teal)" className="shrink-0" />
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--teal)" }}>Análise concluída!</p>
              <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
                {report.total} achado(s){target ? ` em ${target}` : ""}. Comece pelos mais graves.
              </p>
            </div>
          </div>
        )}
        {state === "empty" && (
          <div className="flex items-start gap-3">
            <ShieldCheck size={40} color="var(--success)" className="shrink-0" />
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--success)" }}>Verificação limpa</p>
              <p style={{ fontSize: 13.5, color: "var(--muted)" }}>Nenhum achado — mas isso não garante segurança total.</p>
            </div>
          </div>
        )}
        {state === "error" && (
          <div className="flex items-start gap-3">
            <TriangleAlert size={40} color="var(--warn)" className="shrink-0" />
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--warn)" }}>Análise interrompida</p>
              <p style={{ fontSize: 13.5, color: "var(--muted)" }}>Confira o caminho ou se o app está ligado e tente de novo.</p>
            </div>
          </div>
        )}
        {state === "idle" && (
          <p style={{ fontSize: 13.5, color: "var(--muted)" }}>Pronto para analisar. Escolha uma das opções acima.</p>
        )}
      </div>

      <Panel title="Dicas rápidas">
        <ul className="flex flex-col gap-3">
          {TIPS.map(({ Icon, color, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px]" style={{ background: "var(--card2)" }}>
                <Icon size={18} color={color} />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{text}</div>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="rounded-[14px] p-4" style={{ background: "var(--note-bg)", border: "1px solid var(--teal-line)" }}>
        <div className="flex items-start gap-2">
          <Info size={16} color="var(--teal)" className="mt-0.5 shrink-0" />
          <p style={{ fontSize: 12.5, color: "var(--muted)" }}>
            Esta é uma boa primeira análise, mas não garante 100% de segurança. Use junto com outras
            práticas e mantenha suas dependências atualizadas.
          </p>
        </div>
      </div>
    </div>
  );
}
