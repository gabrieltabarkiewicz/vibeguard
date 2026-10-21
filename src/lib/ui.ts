import type { FindingCategory, Severity } from "@/features/scan";

export const SEVERITY_COLOR: Record<Severity, string> = {
  critica: "var(--sev-critica)",
  alta: "var(--sev-alta)",
  media: "var(--sev-media)",
  baixa: "var(--sev-baixa)",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const CATEGORY_COLOR: Record<FindingCategory, string> = {
  Segredo: "var(--cat-secret)",
  Código: "var(--cat-code)",
  Configuração: "var(--cat-config)",
  Autorização: "var(--cat-auth)",
  Aplicativo: "var(--cat-app)",
};

export const CATEGORY_ORDER: readonly FindingCategory[] = [
  "Segredo",
  "Código",
  "Configuração",
  "Autorização",
  "Aplicativo",
];
