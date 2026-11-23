#!/bin/sh
set -e

echo "→ Aplicando migrations do Prisma..."
npx prisma migrate deploy

# Executa o seed apenas se SEED_ON_START=true (idempotente: usa upsert).
# O seed é compilado junto com o build (dist/prisma/seed.js).
if [ "$SEED_ON_START" = "true" ]; then
  echo "→ Rodando seed inicial..."
  node dist/seed.js || echo "  (seed ignorado/falhou — seguindo mesmo assim)"
fi

echo "→ Iniciando API Nós de Afeto..."
exec node dist/server.js
