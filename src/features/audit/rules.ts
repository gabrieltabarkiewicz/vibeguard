// Regras de auditoria estática: descuidos comuns de código e configuração que
// abrem brecha de segurança. São heurísticas — marcam trechos para revisão, não
// provam uma falha. A linguagem do relatório deixa isso claro.

import type { FindingCategory, Severity } from "@/features/scan";

export interface AuditRule {
  id: string;
  category: FindingCategory;
  title: string;
  severity: Severity;
  /** Aplicado por linha; o primeiro casamento marca a linha. */
  pattern: RegExp;
  explanation: string;
  fix: string;
}

export const AUDIT_RULES: AuditRule[] = [
  {
    id: "react-dangerous-html",
    category: "Código",
    title: "Inserção de HTML sem tratamento (dangerouslySetInnerHTML)",
    severity: "alta",
    pattern: /dangerouslySetInnerHTML/,
    explanation:
      "Jogar HTML direto na tela permite que um texto de usuário vire código no " +
      "navegador de quem visita (ataque XSS), roubando sessão ou dados.",
    fix:
      "Evite dangerouslySetInnerHTML. Se precisar renderizar HTML, limpe o " +
      "conteúdo antes com uma biblioteca de sanitização (ex.: DOMPurify).",
  },
  {
    id: "dom-innerhtml",
    category: "Código",
    title: "Escrita direta em innerHTML",
    severity: "alta",
    pattern: /\.innerHTML\s*=/,
    explanation:
      "Atribuir a innerHTML com dados de usuário executa código no navegador " +
      "(XSS). É uma das brechas mais exploradas.",
    fix: "Use textContent para texto, ou sanitize o HTML antes de inserir.",
  },
  {
    id: "eval-usage",
    category: "Código",
    title: "Uso de eval() ou new Function()",
    severity: "alta",
    pattern: /\b(?:eval|new\s+Function)\s*\(/,
    explanation:
      "eval executa qualquer texto como código. Se esse texto vier de fora, um " +
      "invasor roda o que quiser no seu sistema.",
    fix: "Remova o eval. Quase sempre dá para resolver com JSON.parse ou um mapa de funções.",
  },
  {
    id: "child-process-exec",
    category: "Código",
    title: "Execução de comando do sistema (child_process exec)",
    severity: "alta",
    pattern: /\bexec(?:Sync)?\s*\(\s*`?[^)]*\$\{/,
    explanation:
      "Montar um comando de sistema com um valor de fora permite injeção de " +
      "comando: o invasor acrescenta o próprio comando e ele é executado.",
    fix:
      "Use execFile/spawn passando os argumentos em uma lista separada, nunca " +
      "concatenando entrada do usuário dentro do comando.",
  },
  {
    id: "sql-string-concat",
    category: "Código",
    title: "Consulta SQL montada com interpolação",
    severity: "alta",
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE)\b[^;'"`]*(?:\$\{|"\s*\+|'\s*\+)/i,
    explanation:
      "Montar SQL juntando texto com dados do usuário permite SQL injection: o " +
      "invasor altera a consulta e lê ou apaga o banco.",
    fix:
      "Use consultas parametrizadas (placeholders) ou um ORM. Nunca concatene " +
      "entrada do usuário dentro do texto da query.",
  },
  {
    id: "tls-verification-off",
    category: "Configuração",
    title: "Verificação de certificado TLS desligada",
    severity: "alta",
    pattern: /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0/,
    explanation:
      "Desligar a checagem do certificado deixa a conexão aberta a " +
      "interceptação (man-in-the-middle): alguém no meio lê e altera os dados.",
    fix: "Remova essa opção. Se há um certificado próprio, instale-o em vez de desligar a verificação.",
  },
  {
    id: "cors-wildcard",
    category: "Configuração",
    title: "CORS liberado para qualquer origem",
    severity: "media",
    pattern: /Access-Control-Allow-Origin["'\s,:]+\*|origin\s*:\s*(?:true|["']\*["'])/,
    explanation:
      "Liberar o acesso para qualquer site (origin \"*\") deixa páginas de " +
      "terceiros chamarem sua API em nome do usuário logado.",
    fix: "Troque \"*\" pela lista de domínios que você confia (allowlist).",
  },
  {
    id: "public-secret-var",
    category: "Configuração",
    title: "Segredo em variável pública (NEXT_PUBLIC_/VITE_)",
    severity: "critica",
    pattern: /\b(?:NEXT_PUBLIC_|VITE_|REACT_APP_|EXPO_PUBLIC_)[A-Z0-9_]*(?:SECRET|KEY|TOKEN|PASSWORD|PASSWD|PWD)\b/,
    explanation:
      "Tudo que começa com NEXT_PUBLIC_ (ou VITE_/REACT_APP_) vai para o " +
      "navegador e fica visível para qualquer visitante. Segredo aí é segredo vazado.",
    fix:
      "Tire o prefixo público e leia o valor só no servidor (process.env). Gere " +
      "uma nova chave, porque a atual foi exposta.",
  },
  {
    id: "insecure-cookie",
    category: "Configuração",
    title: "Cookie marcado como inseguro",
    severity: "alta",
    pattern: /httpOnly\s*:\s*false|secure\s*:\s*false|sameSite\s*:\s*['"]?none['"]?/i,
    explanation:
      "Cookie de sessão sem HttpOnly pode ser lido por scripts (roubo de sessão); " +
      "sem Secure, trafega em conexão aberta; SameSite none sem Secure facilita CSRF.",
    fix: "Use httpOnly: true, secure: true e sameSite: 'lax' (ou 'strict') nos cookies de sessão.",
  },
  {
    id: "ssrf-user-url",
    category: "Código",
    title: "Possível SSRF: acesso a URL controlada pelo usuário",
    severity: "alta",
    pattern: /\b(?:fetch|axios(?:\.\w+)?|got|https?\.(?:get|request))\s*\(\s*[^)]*(?:(?:req|request)\.(?:query|params|body)\b|searchParams\.get\s*\()/,
    explanation:
      "Deixar o usuário escolher o endereço que o servidor acessa permite SSRF: ele " +
      "faz o seu servidor chamar a rede interna ou os metadados da nuvem.",
    fix:
      "Valide a URL contra uma lista de domínios permitidos e bloqueie endereços " +
      "internos antes da requisição.",
  },
  {
    id: "path-traversal",
    category: "Código",
    title: "Possível path traversal: caminho de arquivo vindo do usuário",
    severity: "alta",
    pattern: /\b(?:readFileSync|readFile|createReadStream|sendFile|writeFileSync|writeFile|unlink|readdir)\s*\(\s*[^)]*(?:req|request)\.(?:query|params|body)\b|path\.join\s*\([^)]*(?:req|request)\.(?:query|params|body)\b/,
    explanation:
      "Usar o que o usuário digita como caminho de arquivo permite ler ou gravar " +
      "fora da pasta pretendida (ex.: ../../etc/passwd).",
    fix:
      "Normalize o caminho e confira que ele continua dentro da pasta permitida; " +
      "prefira uma lista de nomes/IDs válidos ao caminho livre.",
  },
  {
    id: "weak-hash",
    category: "Código",
    title: "Hash fraco (MD5/SHA1)",
    severity: "media",
    pattern: /createHash\s*\(\s*['"](?:md5|sha1)['"]/i,
    explanation:
      "MD5 e SHA1 são fracos e não servem para senha (são quebráveis). Para senha, " +
      "são perigosos.",
    fix: "Para senha, use bcrypt, scrypt ou argon2. Para integridade simples, prefira SHA-256.",
  },
  {
    id: "insecure-random-token",
    category: "Código",
    title: "Aleatoriedade fraca para token/segredo",
    severity: "media",
    pattern: /\b(?:token|otp|secret|senha|password|reset|nonce|code|apikey|api_key|sessionid|session_id)\w*\s*=\s*[^;\n]*Math\.random\s*\(/i,
    explanation:
      "Math.random() é previsível e não serve para token, código de recuperação ou " +
      "senha: dá para adivinhar o valor.",
    fix:
      "Use um gerador criptográfico: crypto.randomUUID() ou crypto.randomBytes() " +
      "(Node), ou crypto.getRandomValues() (navegador).",
  },
  {
    id: "jwt-hardcoded-secret",
    category: "Configuração",
    title: "Segredo do JWT fixo no código",
    severity: "alta",
    pattern: /jwt\.(?:sign|verify)\s*\(\s*[^,]+,\s*['"][^'"]+['"]/,
    explanation:
      "Um segredo de JWT escrito no código pode ser lido por quem vê o repositório " +
      "e usado para forjar tokens de login.",
    fix: "Guarde o segredo em variável de ambiente (process.env) e use um valor longo e aleatório.",
  },
  {
    id: "jwt-none-algorithm",
    category: "Configuração",
    title: "JWT aceitando algoritmo 'none'",
    severity: "alta",
    pattern: /algorithms?\s*:\s*\[?\s*['"]none['"]/i,
    explanation:
      "Aceitar o algoritmo 'none' deixa qualquer um forjar um token válido sem assinatura.",
    fix: "Fixe um algoritmo seguro (ex.: algorithms: ['HS256'] ou ['RS256']) e nunca aceite 'none'.",
  },
  {
    id: "open-redirect",
    category: "Código",
    title: "Possível open redirect",
    severity: "media",
    pattern: /\.redirect\s*\(\s*[^)]*(?:req|request)\.(?:query|params|body)\b/,
    explanation:
      "Redirecionar para um endereço vindo do usuário permite mandar a vítima a um " +
      "site de phishing que parece vir do seu.",
    fix: "Permita só caminhos internos ou uma lista de destinos confiáveis; não redirecione para URL livre.",
  },
  {
    id: "debug-mode-on",
    category: "Configuração",
    title: "Modo debug ligado",
    severity: "media",
    pattern: /app\.run\([^)]*debug\s*=\s*True|(?:^|\s)DEBUG\s*=\s*True\b|app\.config\[['"]DEBUG['"]\]\s*=\s*True/,
    explanation:
      "Com o modo debug ligado em produção, a página de erro pode revelar código, " +
      "variáveis e até permitir execução de comandos (ex.: Flask/Django).",
    fix: "Desligue o debug em produção (DEBUG = False) e mostre erros genéricos ao usuário.",
  },
  {
    id: "idor-read-by-user-id",
    category: "Autorização",
    title: "Revise: busca por ID vindo do usuário (possível IDOR)",
    severity: "media",
    pattern: /\.(?:findById|findByPk|findUnique|findFirst|findOne|getById)\s*\([^)]*(?:req|request)\.(?:params|query|body)\.\w*id/i,
    explanation:
      "Buscar um registro só pelo ID que o usuário enviou permite que ele troque o " +
      "número e acesse dados de outra pessoa (IDOR). Confirme se há checagem de que " +
      "o recurso pertence a quem fez o pedido.",
    fix:
      "Além do ID, filtre pelo dono (ex.: where id = :id AND user_id = :usuarioLogado) " +
      "ou verifique a permissão antes de devolver o recurso.",
  },
  {
    id: "mass-assignment",
    category: "Autorização",
    title: "Mass assignment: corpo do pedido salvo direto no banco",
    severity: "alta",
    pattern: /\.(?:create|update|updateOne|updateMany|insert|insertOne|save|findOneAndUpdate|findByIdAndUpdate)\s*\(\s*(?:req|request)\.body\b|(?:data|values)\s*:\s*(?:req|request)\.body\b|Object\.assign\s*\([^,]+,\s*(?:req|request)\.body\b|new\s+[A-Z]\w*\s*\(\s*(?:req|request)\.body\b/,
    explanation:
      "Salvar o corpo inteiro do pedido deixa o usuário definir campos que não " +
      "deveria — como papel, is_admin ou saldo —, virando administrador ou mudando " +
      "dados protegidos.",
    fix:
      "Monte o objeto com apenas os campos permitidos (allowlist), em vez de passar " +
      "req.body direto para o banco.",
  },
  {
    id: "client-controlled-role",
    category: "Autorização",
    title: "Revise: papel ou permissão vindo do cliente",
    severity: "media",
    pattern: /(?:req|request)\.(?:body|query|params)\.(?:role|roles|is_?admin|admin|permission|permissions|scope|isadmin)\b/i,
    explanation:
      "Confiar no papel/permissão que o navegador envia permite ao usuário se " +
      "declarar administrador. Esse valor deve vir do servidor (sessão/banco), nunca " +
      "do pedido.",
    fix:
      "Decida o papel e a permissão no servidor, a partir do usuário autenticado; " +
      "ignore qualquer papel enviado pelo cliente.",
  },
];
