// Modelo de observação do app testado. A camada de rede preenche isto; as
// checagens (puras) o transformam em achados. Assim as checagens são testáveis
// sem rede.

export interface PageObservation {
  /** Origem do alvo (ex.: http://localhost:3000). */
  baseUrl: string;
  status: number;
  https: boolean;
  /** Cabeçalhos da resposta, com as chaves em minúsculo. */
  headers: Record<string, string>;
  /** Valor de Access-Control-Allow-Origin quando enviamos uma Origin de teste. */
  corsAllowOrigin: string | null;
  corsAllowCredentials: boolean;
  /** A Origin de teste que enviamos. */
  testOrigin: string;
  /** true se o marcador de injeção voltou sem escapar no corpo. */
  reflectedInjection: boolean;
  /** true se uma página de erro mostrou stack trace. */
  errorStackLeak: boolean;
  /** Cabeçalhos Set-Cookie da resposta principal (um por cookie). */
  setCookies: string[];
}

export interface PathObservation {
  path: string;
  status: number;
  /** Para arquivo sensível: a assinatura casou. Para rota protegida: respondeu
   *  com conteúdo de verdade (ex.: JSON) sem pedir login. */
  matched: boolean;
}

export interface Observation {
  page: PageObservation;
  sensitive: PathObservation[];
  protectedPaths: PathObservation[];
}
