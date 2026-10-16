# VibeGuard

## Produto e stack

- Produto e escopo: `PRODUCT.md`.
- Stack: Next.js 16.4.2 (App Router), React 19.3, TypeScript 5.9 strict, Tailwind 4, Drizzle ORM 0.45 + PostgreSQL (`pg`), Zod 4, Pino 10, Vitest 5. Runtime Node 24; gerenciador pnpm 11.24 (`packageManager` no `package.json`).
- Setup e validações: `docs/setup.md`.

## Comandos canônicos

- Instalar: `pnpm install`
- Desenvolver: `pnpm dev`
- Lint: `pnpm lint`
- Tipos: `pnpm typecheck`
- Regras locais de lint: `pnpm lint:rules`
- Testes: `pnpm test` (modo contínuo: `pnpm test:watch`)
- Build: `pnpm build`
- Gerar SQL: `pnpm db:generate` (sem conexão); aplicar: `pnpm db:migrate` (só em destino autorizado)
- Verificar base: `pnpm check` (lint, tipos, regras, testes e build; não conecta ao banco)

## Acordos de trabalho

- Leia código e instruções pertinentes antes de editar. Declare hipóteses que alterem comportamento ou escopo.
- Complete o pedido com a menor mudança suficiente. Reutilize padrões, componentes e dependências existentes.
- Preserve alterações locais, validação, tratamento de erros, segurança, acessibilidade e requisitos explícitos.
- Não crie abstrações, arquitetura, opções, dependências ou funcionalidades para necessidades não solicitadas.
- Execute checks adequados. Teste lógica relevante e regressões; mudanças triviais não precisam de testes que apenas reproduzem a implementação.
- Não transforme hipóteses em fatos ou integrações pendentes em resultados simulados.
- Continue trabalho já autorizado. Pergunte somente por informação indispensável ou por ação fora da autorização.
- Publicação, mensagens a terceiros, custos e ações destrutivas dependem de autorização pertinente. Instalar ferramentas não concede essa autorização.

## Continuidade de execução

- Durante trabalho autorizado, responda a perguntas de status e retome as ações restantes. Pare se o usuário pedir pausa, cancelar ou mudar o objetivo. Sem execução em andamento, um pedido apenas informativo termina com a resposta.
- Um bloqueio impede só tarefas dependentes. Conclua as independentes que ainda forem seguras e autorizadas; antes de encerrar, confira se resta ação executável no escopo.
- Se um agente falhar ou ficar com estado incerto, confirme que parou antes de assumir seus arquivos. Inspecione alterações parciais e retome do ponto verificado, sem escritores concorrentes.
- Não repita tentativa idêntica sem evidência nova. Respeite limites de custo, tempo e tentativas, gates explícitos e negativas; decisões anteriores não ampliam autorização.
- Ao retomar por handoff, confira arquivos, Git, checks e processos reais. Só afirme execução em segundo plano quando houver processo, agente ou automação ativo e verificável.
- Sem alternativa segura, informe o bloqueio, o trabalho concluído e o que falta para retomar; não apresente pendência como resultado nem prometa continuação automática.

## Padrões e documentação

- Persistência nova: Drizzle ORM + PostgreSQL com driver compatível com o runtime. Preserve a stack existente; registre exceções em `PRODUCT.md` e `docs/architecture.md`.
- Conexão servidor única, pool limitado e inicialização sob demanda. Gere e revise SQL antes de aplicar migrations em destino autorizado; não migre no build ou por request.
- Valide entradas e ambiente com Zod. Use Pino no servidor, sem segredos ou corpos completos. Apresentação chama módulos da funcionalidade, sem importar o cliente de banco.
- Prefira tipos inferidos, consultas parametrizadas, projeções explícitas, listagens limitadas e DTOs seguros. Transações seguem a atomicidade exigida e o suporte do driver.
- Consulte fontes oficiais atuais e o canal estável antes de alterar stack/APIs. Aplique melhorias compatíveis no escopo autorizado; registre fonte, motivo e resultado em `docs/setup.md`. Não migre versões principais ou serviços automaticamente.
- `PRODUCT.md` guarda escopo; `docs/architecture.md`, estrutura e decisões; `docs/design.md`, interface; `docs/onboarding.md`, preparação; `docs/quality.md`, checks. Atualize o documento responsável junto da mudança, sem duplicar regras.

## Ferramentas e estilo

- **Ponytail:** plugin/skill instalado em intensidade `full` para programação. `stop ponytail` desativa o modo.
- **Caveman:** (plugin ainda não instalado; ver `docs/setup.md`) conversa concisa no idioma do usuário, preservando clareza e explicações completas quando solicitadas. Código, documentação e commits têm redação normal. `stop caveman` desativa o estilo.
- **Superpowers:** use skills pertinentes e proporcione o fluxo ao escopo. Instruções explícitas e execução já autorizada prevalecem sobre aprovações repetidas.
- **Context7:** consulte documentação atual para APIs, bibliotecas e setup. Resolva o identificador e consulte um conceito por vez. Nunca envie segredos ou código privado. Se indisponível, use fontes oficiais e registre a limitação.
- **RTK:** use comandos suportados. Com hook nativo ativo, evite wrapper duplicado; sem hook, prefixe comandos suportados. Use `rtk proxy <comando>` para saída original.
- **Graphify:** use grafo existente quando ajudar em perguntas de estrutura. Registre evidência desatualizada/incompleta; não invente relações. Exclua segredos, dependências, skills vendorizadas e arquivos gerados.
- **LLMs:** preserve cliente nativo, modelo principal e autenticação autorizados, inclusive em Graphify e Caveman. Sem política de seleção autorizada, subagentes usam o modelo da sessão. Com essa política, escolha dinamicamente o modelo mais leve capaz de cumprir o aceite e aumente capacidade conforme risco/evidência; respeite restrições explícitas a modelos. Informe modelo e esforço nos controles suportados. Não troque provedor nem ative API paga ou proxy silenciosamente.

Confira instalação e descoberta antes de depender de uma ferramenta. Ausência precisa de registro ou alternativa oficialmente suportada; uma preferência escrita não instala um plugin.

## Skills para Next.js

Instaladas em `.agents/skills/` e copiadas para `.claude/skills/` (lock em `skills-lock.json`):

- `vercel-react-best-practices`: ao escrever/revisar React/Next, dados e desempenho.
- `vercel-composition-patterns`: em decisões concretas de composição e API de componentes.
- `web-design-guidelines`: revisão de interface e acessibilidade.
- `writing-guidelines`: revisão de documentação e prosa.
- `vercel-react-view-transitions`: transições solicitadas e compatíveis com as versões.
- `vercel-optimize`: otimização com tarefa pertinente e métricas Vercel disponíveis.
- `deploy-to-vercel`: publicação/preview autorizados.
- `vercel-cli-with-tokens`: operações Vercel com esse método de autenticação escolhido.
- `find-skills`: descoberta quando faltar uma capacidade concreta.

Instalar skills não executa suas ações. Não force animações, cache, deploy ou mudanças de arquitetura só porque uma skill está disponível.

## Git e colaboração

- Não adicione bloqueios de push em `main`, exigência de branch/worktree ou hooks `pre-commit`/`pre-push` por padrão.
- Lint, tipos, testes e build são checks explícitos; configurações Git adicionais entram quando solicitadas.
- Delegue quando solicitado ou pelo fluxo pertinente e suportado. Tarefas paralelas precisam de arquivos distintos e independência na mesma onda.
- Use ferramentas reais do host; nomes ilustrativos de agentes não são capacidades instaladas.

## Delegação e revisão

- Delegue somente quando isolamento de contexto, especialização ou paralelismo independente compensarem a coordenação; prefira ferramenta determinística ou execução direta para tarefas simples.
- Descubra modelos disponíveis e confira a política autorizada antes de despachar. Prefira capacidade leve para busca, inventário e mudanças mecânicas verificáveis; use capacidade suficiente para decisões complexas, segurança, dados e revisão crítica. Sem suporte à seleção, preserve o modelo permitido e registre a limitação.
- Cada tarefa recebe objetivo, contexto mínimo, arquivos permitidos, dependências, aceite e checks. Um escritor por arquivo; coordenador cuida de lockfiles, configuração compartilhada e integração. Revisores paralelos trabalham somente em leitura.
- Verifique diff e checks antes de aceitar o resultado de um trabalhador. Diante de falha, investigue e escale capacidade/contexto quando necessário; respeite limites finitos de tentativas, tempo e recursos. Não estime economia sem medição.
- Após cada ciclo de implementação ou correção, sempre sugira ao usuário de **3 a 8 ciclos posteriores de code review**, escolhendo quantidade e focos conforme risco e escopo. Entregue motivo e prompt copiável com número, focos e checks reais. Essa faixa é convenção do projeto, não garantia de qualidade; a sugestão não autoriza executar novas rodadas automaticamente.
- Em uma rodada solicitada, cada ciclo revisa o estado atual, registra achados com severidade/local/evidência e verifica correções autorizadas. Use focos complementares, com revisão de integração ao final. Correções internas não reiniciam a contagem; respeite a quantidade combinada e informe riscos residuais.

## Convenções e contexto

- Imports internos usam o alias `@/*` (`src/*`).
- Código de servidor (`src/lib/env.ts`, `src/lib/logger.ts`, `src/db/`) importa `server-only`. Componentes em `src/app/` e `src/components/` não importam `@/db`; acessam dados por módulos da funcionalidade.
- Funcionalidades ficam em `src/features/<nome>/` quando o primeiro fluxo for implementado.
- Este produto lida com código e segredos de terceiros: nunca registre conteúdo de arquivos ou segredos encontrados em logs; mascare segredos em relatórios; testes dinâmicos só contra alvos com propriedade verificada (ver `PRODUCT.md`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
