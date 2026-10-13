# Brev.ly

Encurtador de links full stack: crie URLs curtas, liste e remova links, acompanhe acessos, redirecione pelo slug e exporte um relatório CSV para a Cloudflare R2.

Este repositório tem duas pastas na raiz:

- `server/` — API HTTP com Fastify, Drizzle ORM e PostgreSQL
- `web/` — SPA com React, Vite e Tailwind CSS

## Pré-requisitos

- Node.js 20+
- Docker (para o PostgreSQL e, opcionalmente, para a imagem da API)

## Configuração

### 1. Variáveis de ambiente

```bash
cp server/.env.example server/.env
cp web/.env.example web/.env
```

**Server (`server/.env`)**

| Chave | Uso |
| --- | --- |
| `PORT` | Porta HTTP da API (padrão `3333`) |
| `DATABASE_URL` | Conexão PostgreSQL (`postgresql://...`) |
| `CLOUDFLARE_ACCOUNT_ID` | Conta Cloudflare |
| `CLOUDFLARE_ACCESS_KEY_ID` | Access key do R2 |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | Secret key do R2 |
| `CLOUDFLARE_BUCKET` | Nome do bucket |
| `CLOUDFLARE_PUBLIC_URL` | URL pública do bucket (ex.: `https://pub-....r2.dev`) |

**Web (`web/.env`)**

| Chave | Uso |
| --- | --- |
| `VITE_FRONTEND_URL` | URL do front (usada ao copiar o link curto) |
| `VITE_BACKEND_URL` | URL da API |

Não versione os arquivos `.env` nem cole credenciais neste README.

### 2. Banco de dados

```bash
cd server
docker compose up -d
npm install
npm run db:migrate
```

### 3. API

Ainda em `server/`:

```bash
npm run dev
```

A API sobe em `http://localhost:3333` (ou na porta definida em `PORT`).

### 4. Frontend

Em outro terminal:

```bash
cd web
npm install
npm run dev
```

O front sobe em `http://localhost:5173`.

## Imagem Docker da API

A partir da raiz do repositório:

```bash
docker build -t brevly-server server
```

A imagem espera as mesmas variáveis do `server/.env` em runtime. O banco precisa estar acessível pelo container (por exemplo via `host.docker.internal` no Windows/macOS).

## Endpoints da API

| Método | Caminho | Descrição |
| --- | --- | --- |
| `POST` | `/links` | Cria um link |
| `GET` | `/links` | Lista todos os links (mais recentes primeiro) |
| `GET` | `/links/:shortUrl` | Obtém um link pelo slug (sem incrementar acesso) |
| `PATCH` | `/links/:shortUrl/access` | Incrementa a contagem de acessos |
| `DELETE` | `/links/:shortUrl` | Remove um link |
| `POST` | `/links/exports` | Gera o CSV e devolve `{ reportUrl }` na CDN |

CORS está habilitado com `origin: '*'`.

## Rotas do frontend

| Rota | Página |
| --- | --- |
| `/` | Home: criar, listar, copiar, excluir e baixar CSV |
| `/:shortUrl` | Resolve o link, incrementa o acesso e redireciona |
| `*` | Página de link não encontrado |

## Checklist do desafio

Itens obrigatórios cobertos neste repositório:

- [x] Criar, listar, obter, remover e incrementar acesso a links
- [x] Exportar CSV para CDN (Cloudflare R2) com nome único
- [x] Script `db:migrate` e `.env.example` em `server/` e `web/`
- [x] CORS na API
- [x] Dockerfile da API
- [x] SPA React + Vite com Style Guide, empty/loading e ações bloqueadas
- [x] Páginas `/`, `/:shortUrl` e catch-all de não encontrado
- [x] Layout utilizável em celular e desktop

Fora da `main` (não implementados de propósito): SSR, Open Graph, upload de imagem de preview e UI otimista.

## Testes e build

```bash
cd server
npm test

cd ../web
npm run build
```
