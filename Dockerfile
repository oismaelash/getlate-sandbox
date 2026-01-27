# Development image for GetLate Sandbox
FROM node:20-alpine AS dev

WORKDIR /app

# Install dependencies needed for Prisma and native modules
RUN apk add --no-cache openssl libc6-compat netcat-openbsd

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies) for development
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application code (will be bind-mounted in dev compose, but keep a working default)
COPY . .

EXPOSE 3000

# Default command (will be overridden by docker-compose)
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]

