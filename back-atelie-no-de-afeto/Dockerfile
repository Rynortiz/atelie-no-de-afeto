# ─── Stage 1: build ──────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# openssl é exigido pelo engine do Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Compila o seed isoladamente para dist/seed.js (sem ts-node em runtime)
RUN npx tsc prisma/seed.ts \
      --outDir dist \
      --module commonjs --target ES2020 --esModuleInterop \
      --skipLibCheck --resolveJsonModule --types node

# ─── Stage 2: runtime ────────────────────────────────────────
FROM node:20-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Reaproveita as dependências já instaladas no builder.
# Necessário porque `@prisma/client` e o CLI `prisma` estão em devDependencies
# do projeto, mas são exigidos em runtime (client + `prisma migrate deploy`).
COPY --from=builder /app/node_modules ./node_modules

# Artefatos gerados no stage de build
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY docker-entrypoint.sh ./

# Pasta de uploads (montada como volume no compose)
RUN mkdir -p uploads

RUN chmod +x docker-entrypoint.sh

EXPOSE 3333

# Aplica migrations + seed e então sobe a API
ENTRYPOINT ["./docker-entrypoint.sh"]
