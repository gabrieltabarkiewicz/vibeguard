// API pública do teste do app rodando (DAST não destrutivo, só alvo local).
export { probeApp, type ProbeResult } from "./probe";
export { buildFindings } from "./checks";
export { isLocalTarget, parseTarget } from "./http";
