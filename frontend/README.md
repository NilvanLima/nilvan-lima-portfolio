# QA Store — Frontend (Angular)

Frontend em **Angular 21 (standalone components) + Signals**, criado como aplicação-alvo
para o playground de testes de QA (Cypress, Playwright).

Consome a API em `backend/` (Fastify + Prisma).

## Setup

```bash
npm install
npm start
```

Aplicação sobe em `http://localhost:4200`. Certifique-se de que o backend (`../backend`)
está rodando em `http://localhost:3333` antes de usar — a URL da API está configurada
em `src/environments/environment.development.ts`.

> `angular.json` precisa ter `fileReplacements` na configuração `development` do `build`
> trocando `environment.ts` por `environment.development.ts`, senão o `ng serve` usa a URL
> de produção fictícia e todas as chamadas à API falham (CORS/produtos não aparecem).

Usuário de teste (criado pelo seed do backend): `qa.tester@example.com` / `Test@1234`

## Páginas

- `/` — listagem de produtos (busca, filtro por categoria, paginação)
- `/products/:id` — detalhe do produto
- `/login` / `/register` — autenticação
- `/cart` — carrinho (rota protegida)
- `/checkout` — finalização de compra (rota protegida)
- `/orders` — histórico de pedidos (rota protegida)

## Segurança

Token JWT armazenado em `localStorage` (`AuthService`) — trade-off consciente para
simplicidade do playground. Isso expõe o token a roubo via XSS (qualquer script
injetado na página consegue ler `localStorage`); a alternativa mais segura é o backend
setar um cookie `httpOnly`, o que exigiria mudanças no fluxo de auth dos dois lados.
Não implementado ainda — decisão em aberto.

## Convenções para automação de testes

Todos os elementos interativos têm atributo `data-cy="..."` — use-os tanto no
Cypress (`cy.get('[data-cy=...]')`) quanto no Playwright
(`page.locator('[data-cy=...]')`, ou configure `testIdAttribute: 'data-cy'`
no `playwright.config.ts`).