// Tipos do scanner de segredos. Módulo puro: sem I/O, sem acesso a banco ou ambiente.
// A detecção recebe o conteúdo dos arquivos como texto e devolve achados.

export type Severity = "critica" | "alta" | "media" | "baixa";

/** Um arquivo a ser analisado. O conteúdo é texto já lido por quem chama. */
export interface FileInput {
  path: string;
  content: string;
}

/** Regra de detecção de um formato de segredo conhecido. */
export interface SecretRule {
  /** Identificador estável, usado em relatórios e testes. */
  id: string;
  /** Nome legível do que foi encontrado. */
  title: string;
  /** Severidade padrão de um achado desta regra. */
  severity: Severity;
  /** Padrão aplicado linha a linha. Precisa ter a flag global. */
  pattern: RegExp;
  /** Explicação em linguagem simples do risco. */
  explanation: string;
  /** Correção pronta: o que fazer, em texto copiável. */
  fix: string;
  /**
   * Refinamento opcional: decide se um trecho que casou com o padrão é mesmo
   * um segredo (ex.: um JWT só vira achado se o papel for service_role).
   */
  validate?: (match: string) => boolean;
}

/** Categoria do achado, usada para agrupar o relatório. */
export type FindingCategory = "Segredo" | "Código" | "Configuração" | "Autorização" | "Aplicativo";

/** Um problema encontrado em um arquivo (segredo, código ou configuração). */
export interface Finding {
  ruleId: string;
  category: FindingCategory;
  title: string;
  severity: Severity;
  file: string;
  /** Linha 1-based onde o problema aparece. */
  line: number;
  /** Coluna 1-based do início do trecho. */
  column: number;
  /**
   * O que mostrar ao usuário como prova. Para segredos, é o valor MASCARADO
   * (nunca o segredo inteiro). Para código/configuração, é o trecho da linha.
   */
  evidence: string;
  explanation: string;
  fix: string;
}
