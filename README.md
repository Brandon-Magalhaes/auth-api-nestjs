# API de autenticação — NestJS + PostgreSQL + JWT

API REST de cadastro e login com **NestJS**, **TypeORM/PostgreSQL**, **JWT** (access + refresh token) e documentação **Swagger**.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/signup` | Cria o usuário e devolve o par de tokens |
| POST | `/auth/login` | Autentica e devolve um novo par de tokens |
| POST | `/auth/refresh` | Troca o refresh token por um novo par |
| GET | `/users/me` | Dados do usuário autenticado (Bearer) |

A documentação interativa fica em `http://localhost:3000/api`.

Exemplo:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@testee.com","password":"123456"}'
```

```json
{ "access_token": "...", "refresh_token": "..." }
```

## Como funciona

- Senha e refresh token são gravados com hash **bcrypt** (custo 10) — nunca em texto puro.
- Access token expira em **15 minutos**; refresh token em **7 dias** e é assinado com um segredo separado (`JWT_REFRESH_SECRET`).
- Cada login sobrescreve o refresh token salvo no usuário, então só o último token emitido continua válido.
- O refresh token recebido é comparado com o hash salvo antes de emitir um novo par.
- Entrada validada com **class-validator** (`@IsEmail`, `@MinLength(6)`).
- Usuário com `id` uuid e `email` único (`src/users/entities/user.entity.ts`).
- Rotas protegidas por `JwtAuthGuard` + estratégia `passport-jwt` (`src/auth/strategies/jwt.strategy.ts`).

## Stack

NestJS 11 · TypeORM · PostgreSQL · @nestjs/jwt + passport-jwt · bcrypt · class-validator · @nestjs/swagger

## Como rodar

```bash
npm install
cp .env.example .env
npm run start:dev
```

É preciso ter um PostgreSQL acessível. Com o `.env` preenchido, o TypeORM cria a tabela `user` automaticamente (`synchronize: true`).

## Variáveis de ambiente

| Variável | Uso | Padrão no código |
|---|---|---|
| `DATABASE_HOST` | host do PostgreSQL | `localhost` |
| `DATABASE_PORT` | porta | `5432` |
| `DATABASE_USER` | usuário | `postgres` |
| `DATABASE_PASSWORD` | senha | `senha` |
| `DATABASE_NAME` | nome do banco | `auth_db` |
| `JWT_SECRET` | assinatura do access token | — |
| `JWT_REFRESH_SECRET` | assinatura do refresh token | — |
| `JWT_EXPIRES_IN` | validade do access token | `1d` |

## Limitações conhecidas

- `synchronize: true` é conveniente em desenvolvimento, mas inadequado em produção — o caminho é usar migrations.
- **Não há testes automatizados**, apesar dos scripts `test` do scaffold do Nest.
- Não há rate limiting nem bloqueio por tentativas de login.
- Os padrões do banco em `app.module.ts` servem só para o app subir sem `.env`; em qualquer ambiente real use as variáveis.
