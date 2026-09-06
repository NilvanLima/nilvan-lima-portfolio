# E-commerce Playground API

Backend em **Fastify + TypeScript + Prisma (SQLite)**, criado como aplicação-alvo
para o playground de testes de QA (Cypress, Playwright, testes de API, k6).

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

> Use os scripts `npm run` (não `npx prisma ...` direto) — o `npx` pode ignorar a
> versão do Prisma travada no `package.json` (6.16.3) e baixar a mais recente,
> que mudou toda a CLI e quebra os comandos abaixo.

Servidor sobe em `http://localhost:3333`, documentação Swagger em `http://localhost:3333/docs`.

Usuário de teste criado pelo seed: `qa.tester@example.com` / `Test@1234`

`JWT_SECRET` é obrigatório — o servidor recusa subir sem essa variável definida no `.env`
(sem fallback hardcoded, de propósito).

## Endpoints principais

| Método | Rota                     | Auth | Descrição                          |
|--------|---------------------------|------|-------------------------------------|
| POST   | /auth/register             | não  | Cria usuário                        |
| POST   | /auth/login                 | não  | Autentica e retorna JWT             |
| GET    | /products                   | não  | Lista produtos (filtro + paginação) |
| GET    | /products/:id                | não  | Detalhe do produto                  |
| POST   | /products                    | não* | Cria produto (uso em testes/admin)  |
| GET    | /cart                        | sim  | Retorna carrinho do usuário         |
| POST   | /cart/items                  | sim  | Adiciona item ao carrinho           |
| PATCH  | /cart/items/:productId        | sim  | Atualiza quantidade                 |
| DELETE | /cart/items/:productId        | sim  | Remove item                         |
| POST   | /orders                      | sim  | Checkout (carrinho → pedido)        |
| GET    | /orders                      | sim  | Lista pedidos                       |
| GET    | /orders/:id                   | sim  | Detalhe do pedido                   |

\* Sem autenticação de propósito nesta fase inicial, para facilitar popular dados
nos testes E2E/API. Pode ser protegida com uma role de admin depois.

Rotas autenticadas esperam o header `Authorization: Bearer <token>`.

## Segurança

- **JWT** expira em 2h (`sign: { expiresIn: "2h" }` no plugin de auth)
- **Rate limit**: 5 tentativas/min em `/auth/login` e `/auth/register`; 100 req/min no resto da API
- **Security headers** via `@fastify/helmet` (CSP desativado só por causa do Swagger UI em `/docs`)
- Senhas com `bcrypt`, validação de entrada com `zod` em todas as rotas de escrita

## Scripts

- `npm run dev` — sobe com hot reload
- `npm run build` / `npm start` — build de produção
- `npm run prisma:migrate` — cria/aplica migrações
- `npm run seed` — popula usuário de teste e produtos