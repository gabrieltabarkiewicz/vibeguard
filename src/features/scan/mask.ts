// Mascaramento de segredos para exibição no relatório.
// Mantém só um prefixo e um sufixo curtos: o bastante para o usuário localizar o
// trecho, sem revelar a parte secreta. Nunca registre o valor original em log.

const DEFAULT_KEEP_START = 4;
const DEFAULT_KEEP_END = 2;

/**
 * Devolve uma versão mascarada do segredo: `abcd…yz`.
 * Trechos curtos (<= prefixo + sufixo) são totalmente mascarados para não vazar
 * nada além do tamanho.
 */
export function maskSecret(
  secret: string,
  keepStart: number = DEFAULT_KEEP_START,
  keepEnd: number = DEFAULT_KEEP_END,
): string {
  if (keepStart < 0 || keepEnd < 0) {
    throw new Error("keepStart e keepEnd precisam ser >= 0");
  }
  if (secret.length <= keepStart + keepEnd) {
    return "•".repeat(secret.length);
  }
  const start = secret.slice(0, keepStart);
  const end = secret.slice(secret.length - keepEnd);
  return `${start}…${end}`;
}
