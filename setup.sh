#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  Setup de desenvolvimento — Ateliê Nós de Afeto
#  Gera o certificado local (mkcert) e o arquivo .env.
# ──────────────────────────────────────────────────────────────
set -e

HOST="meuapp.local"
CERT_DIR="nginx/certs"

echo "─────────────────────────────────────────────"
echo " Setup — Ateliê Nós de Afeto"
echo "─────────────────────────────────────────────"

# ─── 1. .env ─────────────────────────────────────────────────
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ .env criado a partir de .env.example (revise os valores!)"
else
  echo "• .env já existe — mantido."
fi

# ─── 2. Certificado TLS local ────────────────────────────────
if ! command -v mkcert >/dev/null 2>&1; then
  echo "✗ mkcert não encontrado. Instale-o e rode novamente."
  echo "  https://github.com/FiloSottile/mkcert#installation"
  exit 1
fi

mkdir -p "$CERT_DIR"
if [ ! -f "$CERT_DIR/$HOST.pem" ]; then
  mkcert -install
  ( cd "$CERT_DIR" && mkcert "$HOST" )
  echo "✓ Certificado gerado em $CERT_DIR/"
else
  echo "• Certificado já existe — mantido."
fi

# ─── 3. /etc/hosts ───────────────────────────────────────────
if ! grep -q "$HOST" /etc/hosts 2>/dev/null; then
  echo ""
  echo "⚠  Adicione esta linha ao seu /etc/hosts:"
  echo "     127.0.0.1   $HOST"
fi

echo ""
echo "Pronto! Agora rode:  docker compose up -d --build"
echo "Acesse:             https://$HOST"
