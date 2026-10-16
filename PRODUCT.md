# VibeGuard

> "VibeGuard" é um nome de trabalho (hipótese reversível). Troque aqui, em `package.json` e no `layout.tsx` quando o nome for definido.

## Problema e objetivo

Quem cria software com IA (Cursor, Lovable, Bolt, v0, Claude Code) publica apps sem saber revisar segurança. As falhas se repetem: chaves de API no front-end, banco Supabase/Firebase sem RLS, autorização feita só na interface, IDOR, endpoints de debug expostos, dependências vulneráveis ou alucinadas, prompt injection e ausência de rate limit. Hoje essas pessoas só descobrem quando a conta da API estoura ou os dados vazam.

O VibeGuard testa o software, emite um diagnóstico em linguagem simples e entrega a correção pronta, em forma de diff de código ou de prompt para colar na ferramenta de IA usada.

## Público e papéis

- **Vibecoder:** dono de um app ou projeto. Envia o alvo, lê o relatório e aplica as correções. Pode não ter formação em segurança.
- Papéis de equipe ou administrador não foram pedidos e não existem na primeira versão.

## Fluxos da versão inicial

1. **Apontar a pasta:** o usuário roda o VibeGuard na própria máquina e informa o caminho da pasta do projeto a analisar.
2. **Analisar:** os motores aplicáveis rodam localmente sobre os arquivos e produzem achados. O código nunca sai da máquina do usuário.
3. **Ler relatório:** cada achado mostra falha, severidade, evidência, explicação em linguagem simples e correção (diff ou prompt).
4. **Testar o app ligado (teste dinâmico):** com o app rodando, o usuário informa o endereço **local** (localhost) e o VibeGuard faz checagens fortes, porém não destrutivas. A propriedade é garantida pela restrição a alvos locais: a ferramenta recusa qualquer endereço que não seja da própria máquina. Não há brute force, negação de serviço nem exploração que altere dados.

## MVP

Em ordem de prioridade (hipótese, ver pendências):

1. Scanner de segredos sobre o código local: chaves de API, `service_role` do Supabase, `.env` versionado.
2. Relatório com diagnóstico e correção para cada achado do scanner.
3. Análise de dependências (SCA): pacotes com CVE conhecido e pacotes inexistentes ou suspeitos.
4. Auditoria de configuração Supabase/Firebase (RLS desativado, regras abertas).
5. Testes dinâmicos (DAST) contra um alvo verificado: IDOR, autorização só no front, endpoints expostos, rate limit, headers e CORS.

## Fora de escopo

- Venda, planos, cobrança e hospedagem como serviço: a primeira versão é uma ferramenta local, aberta para a galera rodar na própria máquina.
- Conta de usuário, equipes, multi-tenancy e papéis administrativos.
- Enviar o código do usuário para qualquer servidor nosso.
- Correção automática com commit ou push no repositório do usuário (a correção é sugerida, não aplicada).
- Testes contra alvos sem verificação de propriedade.
- Testes de negação de serviço ou carga.

## Requisitos

- Interface em português (pt-BR), mobile first e acessível (ver `docs/design.md`).
- Explicações para leigos; o detalhe técnico fica disponível, não em primeiro plano.
- Toda correção traz, quando aplicável, um prompt pronto para colar em ferramentas de IA.
- **Segurança da própria plataforma:** o código e os segredos enviados pelos usuários são dados sensíveis. Não registrar conteúdo de arquivos nem segredos encontrados em logs; mascarar segredos no relatório (mostrar só prefixo e sufixo); definir retenção dos artefatos enviados.
- **Uso responsável:** testes dinâmicos exigem verificação de propriedade do alvo; payloads são controlados e não destrutivos; há limite de requisições por análise.

## Restrições e decisões técnicas

- **Local-first:** o VibeGuard roda na máquina do usuário. Ele executa `pnpm dev`, abre o localhost e aponta a pasta do projeto; o servidor Next (na própria máquina) lê os arquivos e mostra o relatório. Não há servidor hospedado nem envio de código para fora.
- Next.js 16.4.2 (App Router), React 19.3, TypeScript strict, Tailwind 4, ESLint 9, pnpm 11.24 e Node 24.
- Persistência: Drizzle ORM + PostgreSQL (`pg`) fica instalado para um histórico opcional no futuro, mas **o MVP local não usa banco** — o relatório é gerado em memória e mostrado na hora. Nenhuma tabela foi criada.
- Leitura da pasta e os motores de análise rodam no servidor (Node), nunca no cliente; o navegador só recebe o relatório (com segredos mascarados).
- Integração com GitHub, empacotamento (ex.: `npx`) e qualquer modo hospedado entram depois, por necessidade concreta.

## Hipóteses e pendências

| Item | Tipo | Impacto | Próximo passo |
|---|---|---|---|
| Nome "VibeGuard" | Hipótese reversível | Marca, domínio e textos | Usuário define o nome |
| Ponto de entrada | **Decidido (2026-10-16)** | App local no navegador: o usuário aponta uma pasta do projeto e o servidor Next local a varre. Upload e GitHub ficam para depois | — |
| Autenticação dos usuários | Dispensada no MVP | Ferramenta local, sem conta | Revisar só se/quando houver modo hospedado |
| Execução das análises (síncrona ou em fila/worker) | Hipótese: síncrona no MVP | Análises longas (DAST) exigem fila | Revisar ao implementar o DAST |
| Distribuição (como a galera instala) | Pendente | Hoje é clonar + `pnpm dev`; um `npx`/binário seria mais fácil | Decidir após o primeiro fluxo funcionar |
| Limite de tamanho da pasta/arquivo | Hipótese: pular arquivos grandes e binários, teto de arquivos | Varredura pode ficar lenta em repos enormes | Ajustar com uso real |

## Critérios de aceitação

Produto (para os fluxos do MVP):

- Um código com uma chave de API real de formato conhecido gera um achado com severidade, arquivo e linha, segredo mascarado, explicação e correção.
- Um código sem segredos gera um relatório vazio explícito, sem falsos positivos nas fixtures de teste.
- Nenhum segredo encontrado aparece por inteiro em logs ou no relatório.
- Um teste dinâmico não roda contra um alvo cuja propriedade não foi verificada.

Setup técnico: ver `docs/setup.md`.

## Próxima entrega

O scanner de segredos foi implementado em `src/features/scan/` (regras para OpenAI, Anthropic, Stripe live/test, AWS, Google, GitHub, Supabase `service_role` via JWT e chaves PEM; mascaramento; elevação de severidade quando o segredo está em variável pública; testes com fixtures positivas e negativas). É um módulo puro, ainda sem interface nem persistência.

Próximo passo (em andamento): o app local no navegador. O usuário aponta a pasta do projeto, o servidor Next varre os arquivos (ignorando `node_modules`, pastas de build e arquivos binários/grandes) e a tela mostra cada achado por severidade, com trecho mascarado, explicação e correção copiável.

## Manutenção

Atualize este documento quando objetivo, escopo, restrições ou critérios de aceitação mudarem. Decisões técnicas e evidências detalhadas ficam em `docs/architecture.md` e `docs/setup.md`.
