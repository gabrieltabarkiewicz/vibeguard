# VibeGuard

Testes de segurança para quem cria software com IA. O VibeGuard encontra as falhas mais comuns em apps feitos com vibe coding (chaves expostas, banco sem RLS, autorização só no front, dependências vulneráveis), explica o risco em linguagem simples e entrega a correção pronta. Escopo e público em [PRODUCT.md](PRODUCT.md).

## Executar

Requer Node 24 e pnpm 11 (versão fixada em `packageManager`).

```bash
pnpm install
pnpm dev
```

A aplicação abre em http://localhost:3000. A base atual roda sem banco; `DATABASE_URL` só é necessária quando o primeiro fluxo com persistência existir (ver [onboarding](docs/onboarding.md)).

Verificação completa (lint, tipos, regras locais, testes e build, sem credenciais):

```bash
pnpm check
```

## Documentação

- [Produto e escopo](PRODUCT.md).
- [Preparação local](docs/onboarding.md).
- [Estrutura e decisões técnicas](docs/architecture.md).
- [Design e acessibilidade](docs/design.md).
- [Checks de qualidade](docs/quality.md).
- [Instruções para agentes](AGENTS.md).
- [Setup e evidências](docs/setup.md).

## Próxima entrega

Scanner de segredos como módulo de servidor com testes: dado um conjunto de arquivos, retorna achados com arquivo, linha, severidade, segredo mascarado, explicação e correção. Critério: as fixtures positivas geram achados e as negativas não geram nenhum. Pendente: o usuário decidir o ponto de entrada (repositório, upload ou URL), que define a interface seguinte.
