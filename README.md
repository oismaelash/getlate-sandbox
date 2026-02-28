# GetLate Sandbox

Complete sandbox to test and simulate the GetLate API locally.

## Features

- **API Keys**: API key management
- **Profiles**: Create and manage GetLate profiles
- **Social Accounts**: Direct creation of social accounts (no OAuth)
- **Posts**: Create and schedule posts (Post, Reel, Carousel)
- **Scheduling System**: Redis + BullMQ to process scheduled posts

## Requirements

- Docker and Docker Compose
- Node.js 18+ (for local development)

## Installation

1. Clone the repository and enter the directory:
```bash
cd GetLate-Sandbox
```

2. Configure environment variables (optional, default values are already set):
```bash
cp .env.example .env
```

3. Start all services via Docker Compose (includes PostgreSQL, Redis, Next.js app, and worker):
```bash
docker-compose up
```

Or in detached mode (background):
```bash
docker-compose up -d
```

4. Access the application at `http://localhost:3000`

Docker Compose will:
- Start PostgreSQL on port 5433
- Start Redis on port 6380
- Start the Next.js application on port 3000 (with hot reload)
- Start the worker to process scheduled posts
- Automatically configure the database (Prisma generate + db push)

### Local Development (without Docker)

If you prefer to run locally:

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Start only PostgreSQL and Redis:
```bash
docker-compose up db redis -d
```

4. Configure the database:
```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

6. (Optional) Start the worker in another terminal:
```bash
npm run worker
```

## Usage

1. Open `http://localhost:3000`
2. Create an API Key on the API Keys page
3. Create a Profile on the Profiles page
4. Connect a Social Account on the Accounts page
5. Create and schedule posts on the Posts page

## Project Structure

```
GetLate-Sandbox/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/          # Mock GetLate API endpoints
│   │   │   ├── api-keys/     # Internal API for frontend
│   │   │   ├── profiles/     # Internal API for frontend
│   │   │   ├── accounts/     # Internal API for frontend
│   │   │   └── posts/       # Internal API for frontend
│   │   ├── api-keys/         # Frontend: Manage API Keys
│   │   ├── profiles/         # Frontend: Manage Profiles
│   │   ├── accounts/          # Frontend: Manage Social Accounts
│   │   └── posts/             # Frontend: Manage Posts
│   ├── lib/
│   │   ├── db.ts             # Prisma client
│   │   ├── redis.ts          # Redis client
│   │   ├── queue.ts          # BullMQ queue
│   │   ├── auth.ts           # API authentication
│   │   └── post-utils.ts    # Post utilities
│   └── workers/
│       └── post-scheduler.ts # Worker to process scheduled posts
└── prisma/
    └── schema.prisma         # Database schema
```

## API Endpoints

### Mock GetLate API (requires Bearer token authentication)

- `POST /api/v1/profiles` - Create profile
- `GET /api/v1/profiles/:id/social-accounts` - List profile social accounts
- `GET /api/v1/accounts?profileId=...` - List accounts
- `POST /api/v1/accounts` - Create account
- `DELETE /api/v1/accounts/:id` - Remove account
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts/:id` - Fetch post
- `DELETE /api/v1/posts/:id` - Delete post

### Internal API (for frontend)

- `GET /api/api-keys` - List API keys
- `POST /api/api-keys` - Create API key
- `GET /api/profiles` - List profiles
- `POST /api/profiles` - Create profile
- `GET /api/accounts` - List accounts
- `POST /api/accounts` - Create account
- `DELETE /api/accounts/:id` - Remove account
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `DELETE /api/posts/:id` - Delete post

## ContentType Inference

The system automatically infers content type based on media files:

- **1 image** → `post`
- **1 video** → `reel`
- **2+ images** → `carousel`

## Scheduling System

Posts can be published immediately or scheduled. Scheduled posts are processed by the BullMQ worker, which updates the status to `published` at the specified date/time.

## Technologies

- Next.js 15 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- TailwindCSS
