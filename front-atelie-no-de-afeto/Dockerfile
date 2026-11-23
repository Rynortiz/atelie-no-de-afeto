# ─── Stage 1: build do React (CRA) ───────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# A URL da API é injetada no build (CRA lê REACT_APP_* em build time)
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 2: servir estático com nginx interno ──────────────
FROM nginx:1.27-alpine AS runtime

# Config mínima: serve o SPA na porta 80 (rede interna).
# O TLS e os cabeçalhos de segurança ficam no Nginx de borda.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
