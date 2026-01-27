# GetLate Sandbox - Ilumin Cloud Deployment

## Informações da Aplicação

- **Nome da Aplicação:** getlate-sandbox
- **App ID:** 478
- **App Name:** custom-u37-app-a9dc
- **Compose Slug:** u37-app-a9dc
- **Servidor:** s749b2c.iluminapp.com
- **URL da Aplicação:** https://custom-u37-app-a9dc.s749b2c.iluminapp.com

## Versão Atual

- **Versão:** v1.1
- **Image Tag:** 20260126213817
- **Image:** ghcr.io/iluminapp/u37-getlate-sandbox:20260126213817
- **Image Latest:** ghcr.io/iluminapp/u37-getlate-sandbox:latest

## Histórico de Deploys

### v1.1 (2026-01-26)
- **Timestamp:** 20260126213817
- **Status:** Deploy realizado, aguardando atualização

### v1.0 (2026-01-26)
- **Timestamp:** 20260126212504
- **Status:** Instalado e ativo

## Serviços

A aplicação inclui os seguintes serviços:

1. **app** - Aplicação Next.js principal (porta 4000)
2. **db** - PostgreSQL 16 (banco de dados)
3. **redis** - Redis 7 (cache e filas)

## Variáveis de Ambiente

- `DATABASE_URL` - URL de conexão com PostgreSQL
- `REDIS_URL` - URL de conexão com Redis
- `NODE_ENV` - Ambiente de execução (production)
- `NEXT_PUBLIC_API_URL` - URL pública da API
- `DB_PASSWORD` - Senha do banco de dados (gerenciada pela Ilumin)

## Volumes

- `postgres_data` - Dados do PostgreSQL
- `redis_data` - Dados do Redis
- `uploads_data` - Arquivos de upload da aplicação

## Notas

- A aplicação pode demorar de 30 a 90 segundos para inicializar após o deploy
- O SSL é configurado automaticamente pela Ilumin Cloud
- Para atualizar a versão, use a ferramenta de atualização com a nova tag de imagem
