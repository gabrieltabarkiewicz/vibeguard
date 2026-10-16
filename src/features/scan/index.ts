// API pública do scanner de segredos.
export { scanContent, scanFiles } from "./scan";
export { maskSecret } from "./mask";
export { RULES } from "./rules";
export type { FileInput, Finding, FindingCategory, SecretRule, Severity } from "./types";
