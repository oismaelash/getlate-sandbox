# GetLate Sandbox

Sandbox completo para testar e simular a API GetLate localmente.

## Funcionalidades

- **API Keys**: Gerenciamento de chaves de API
- **Profiles**: Criação e gerenciamento de perfis GetLate
- **Social Accounts**: Criação direta de contas sociais (sem OAuth)
- **Posts**: Criação e agendamento de posts (Post, Reel, Carousel)
- **Sistema de Agendamento**: Redis + BullMQ para processar posts agendados

## Requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)

## Instalação

1. Clone o repositório e entre no diretório:
```bash
cd GetLate-Sandbox
```

2. Configure as variáveis de ambiente (opcional, valores padrão já estão configurados):
```bash
cp .env.example .env
```

3. Inicie todos os serviços via Docker Compose (inclui PostgreSQL, Redis, Next.js app e worker):
```bash
docker-compose up
```

Ou em modo detached (background):
```bash
docker-compose up -d
```

4. Acesse a aplicação em `http://localhost:3000`

O Docker Compose irá:
- Iniciar PostgreSQL na porta 5433
- Iniciar Redis na porta 6380
- Iniciar a aplicação Next.js na porta 3000 (com hot reload)
- Iniciar o worker para processar posts agendados
- Configurar automaticamente o banco de dados (Prisma generate + db push)

### Desenvolvimento Local (sem Docker)

Se preferir rodar localmente:

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie apenas PostgreSQL e Redis:
```bash
docker-compose up db redis -d
```

4. Configure o banco de dados:
```bash
npx prisma generate
npx prisma db push
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. (Opcional) Inicie o worker em outro terminal:
```bash
npm run worker
```

## Uso

1. Acesse `http://localhost:3000`
2. Crie uma API Key na página de API Keys
3. Crie um Profile na página de Profiles
4. Conecte uma Social Account na página de Accounts
5. Crie e agende posts na página de Posts

## Estrutura do Projeto

```
GetLate-Sandbox/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/          # Mock GetLate API endpoints
│   │   │   ├── api-keys/     # API interna para frontend
│   │   │   ├── profiles/     # API interna para frontend
│   │   │   ├── accounts/     # API interna para frontend
│   │   │   └── posts/       # API interna para frontend
│   │   ├── api-keys/         # Frontend: Gerenciar API Keys
│   │   ├── profiles/         # Frontend: Gerenciar Profiles
│   │   ├── accounts/          # Frontend: Gerenciar Social Accounts
│   │   └── posts/             # Frontend: Gerenciar Posts
│   ├── lib/
│   │   ├── db.ts             # Prisma client
│   │   ├── redis.ts          # Redis client
│   │   ├── queue.ts          # BullMQ queue
│   │   ├── auth.ts           # Autenticação API
│   │   └── post-utils.ts    # Utilitários para posts
│   └── workers/
│       └── post-scheduler.ts # Worker para processar posts agendados
└── prisma/
    └── schema.prisma         # Schema do banco de dados
```

## API Endpoints

### Mock GetLate API (requer autenticação Bearer token)

- `POST /api/v1/profiles` - Criar profile
- `GET /api/v1/profiles/:id/social-accounts` - Listar social accounts do profile
- `GET /api/v1/accounts?profileId=...` - Listar accounts
- `POST /api/v1/accounts` - Criar account
- `DELETE /api/v1/accounts/:id` - Remover account
- `POST /api/v1/posts` - Criar post
- `GET /api/v1/posts/:id` - Buscar post
- `DELETE /api/v1/posts/:id` - Deletar post

### API Interna (para frontend)

- `GET /api/api-keys` - Listar API keys
- `POST /api/api-keys` - Criar API key
- `GET /api/profiles` - Listar profiles
- `POST /api/profiles` - Criar profile
- `GET /api/accounts` - Listar accounts
- `POST /api/accounts` - Criar account
- `DELETE /api/accounts/:id` - Remover account
- `GET /api/posts` - Listar posts
- `POST /api/posts` - Criar post
- `DELETE /api/posts/:id` - Deletar post

## Inferência de ContentType

O sistema infere automaticamente o tipo de conteúdo baseado nos arquivos de mídia:

- **1 imagem** → `post`
- **1 vídeo** → `reel`
- **2+ imagens** → `carousel`

## Sistema de Agendamento

Posts podem ser publicados imediatamente ou agendados. Posts agendados são processados pelo worker BullMQ que atualiza o status para `published` na data/hora especificada.

## Tecnologias

- Next.js 15 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- TailwindCSS

