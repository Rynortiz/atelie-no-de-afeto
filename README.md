# Ateliê Nós de Afeto

Plataforma de catálogo, estoque e pedidos para um ateliê de crochê artesanal.
Composta por uma API REST, uma interface web e um aplicativo Android, todos
consumindo o mesmo backend.

O propósito do produto é substituir o atendimento por mensagens avulsas: o
cliente vê as peças com foto, preço e disponibilidade sem precisar perguntar,
e a artesã gerencia o catálogo sem depender de planilha.

---

## Arquitetura

Monólito modular em container, com proxy reverso à frente e cache
distribuído. As decisões que levaram a esse desenho estão registradas em
`docs/ARQUITETURA.md`, cada uma com as alternativas consideradas.

```
Navegador ─┐
           ├─► Nginx (TLS, proxy) ─┬─► React (SPA)
App Android┘                       └─► API Express ─┬─► MySQL
                                                     ├─► Redis (cache + eventos)
                                                     └─► Volume de uploads
```

Apenas o Nginx publica portas. API, banco, cache e volume permanecem na rede
interna do Docker.

| Camada | Tecnologia |
|---|---|
| API | Node.js, Express, TypeScript, Prisma |
| Banco | MySQL 8 |
| Cache e eventos | Redis 7 — cache-aside e Pub/Sub |
| Web | React |
| Mobile | React Native CLI (Android) |
| Infraestrutura | Docker Compose, Nginx com TLS |

---

## Executando com Docker

É o caminho recomendado: sobe tudo com um comando e reproduz o ambiente de
forma idêntica em qualquer máquina.

### Pré-requisitos

- Docker Desktop
- [mkcert](https://github.com/FiloSottile/mkcert) para os certificados locais

### 1. Variáveis de ambiente

Copie o exemplo e preencha com valores próprios:

```bash
cp .env.example .env
```

```env
# Banco
DB_ROOT_PASSWORD=escolha_uma_senha
DB_NAME=nos_de_afeto
DB_USER=usuario
DB_PASSWORD=escolha_outra_senha

# Backend
BACKEND_PORT=3333
JWT_SECRET=uma_chave_longa_e_aleatoria
JWT_EXPIRES_IN=7d
NODE_ENV=production
BASE_URL=https://meuapp.local
LOG_LEVEL=info

# Frontend
FRONTEND_API_URL=/api
```

O `.env` não é versionado. O `JWT_SECRET` deve ser longo e aleatório —
alterá-lo depois invalida todas as sessões ativas.

### 2. Certificado local

```bash
mkcert -install
mkcert -key-file nginx/certs/key.pem -cert-file nginx/certs/cert.pem meuapp.local
```

E aponte o domínio para a máquina local, no arquivo de hosts
(`C:\Windows\System32\drivers\etc\hosts` no Windows,
`/etc/hosts` no Linux e macOS):

```
127.0.0.1  meuapp.local
```

### 3. Subir

```bash
docker compose up -d --build
```

As migrations e o seed são aplicados automaticamente na inicialização do
backend.

| Serviço | Endereço |
|---|---|
| Aplicação | https://meuapp.local |
| Saúde da API | https://meuapp.local/health |

**Credenciais iniciais:** `admin@nosdeafeto.com` / `Admin123`

### Modo de desenvolvimento

O arquivo de sobreposição publica a porta do backend e a do banco, necessário
para o aplicativo móvel e para inspecionar o MySQL por fora:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

Isso expõe a API em `localhost:3333` e o MySQL em `localhost:3307`. É
opt-in de propósito: no modo padrão o isolamento se mantém.

---

## Executando sem Docker

Possível para desenvolver só o backend, mas exige MySQL e Redis instalados
na máquina.

```bash
cd back-atelie-no-de-afeto
npm install
```

Crie um `.env` nessa pasta:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nos_de_afeto"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="sua_chave_secreta"
JWT_EXPIRES_IN="7d"
PORT=3333
BASE_URL=""
LOG_LEVEL=debug
```

> `BASE_URL` vazio é intencional: as imagens são gravadas com caminho
> relativo, e cada cliente resolve contra a própria base. Um endereço fixo
> funcionaria no navegador **ou** no emulador, nunca nos dois.

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

O frontend:

```bash
cd front-atelie-no-de-afeto
npm install
npm start
```

Com `REACT_APP_API_URL=http://localhost:3333/api` no `.env` dessa pasta.

Sem Redis rodando, a API funciona normalmente — mais lenta, sem cache e sem
eventos. O `/health` reporta `status: degradado`.

---

## Aplicativo móvel

```bash
cd mobile-atelie
npm install
```

O endereço da API fica em `src/api/config.js` e depende do alvo:

| Alvo | Host | Observação |
|---|---|---|
| Emulador Android | `http://10.0.2.2:3333` | alias do emulador para o host |
| Aparelho por USB | `http://localhost:3333` | requer `adb reverse tcp:3333 tcp:3333` |

Com a API no ar pelo modo de desenvolvimento:

```bash
npx react-native run-android
```

Dois recursos exigem passos adicionais, documentados em
`mobile-atelie/FONTE.md` e `mobile-atelie/IMAGEM.md`: a tipografia da marca,
que precisa ser vinculada e recompilada, e a seleção de imagens pela câmera,
que depende do `react-native-image-picker` e da permissão no manifesto.

---

## Estrutura

```
.
├── back-atelie-no-de-afeto/   API REST
│   ├── src/
│   │   ├── infra/             Redis, contexto de requisição, inicialização
│   │   ├── controllers/       entrada HTTP
│   │   ├── services/          regras de negócio
│   │   ├── repositories/      acesso a dados
│   │   ├── middlewares/       autenticação, papéis, upload, correlação
│   │   └── utils/
│   ├── prisma/                schema, migrations e seed
│   └── openapi.yaml           contrato da API
│
├── front-atelie-no-de-afeto/  interface web
├── mobile-atelie/             aplicativo Android
├── nginx/                     configuração do proxy e certificados
├── cypress/                   testes end-to-end
├── docs/                      documentação do projeto
│
├── docker-compose.yml
├── docker-compose.dev.yml     sobreposição de desenvolvimento
└── .github/workflows/         pipeline de integração contínua
```

---

## API

O contrato completo está em `back-atelie-no-de-afeto/openapi.yaml` — 18
caminhos e 30 operações. Para navegar pela especificação, cole o arquivo em
[editor.swagger.io](https://editor.swagger.io).

| Recurso | Caminho | Acesso |
|---|---|---|
| Autenticação | `/api/auth` | público |
| Produtos | `/api/products` | leitura pública, escrita só admin |
| Categorias | `/api/categories` | leitura pública, escrita só admin |
| Usuários | `/api/users` | perfil próprio, listagem só admin |
| Carrinho | `/api/carrinho` | autenticado |
| Pedidos | `/api/orders` | próprios pedidos; gestão só admin |
| Upload | `/api/upload` | só admin |

Toda resposta traz o cabeçalho `x-correlation-id`, que amarra os logs de uma
requisição — inclusive as operações de cache e os eventos que ela disparou.

---

## Cache e eventos

A listagem do catálogo é servida por cache-aside com TTL de 5 minutos, e as
escritas invalidam as chaves afetadas. Mudanças no catálogo publicam eventos
de domínio no Redis, consumidos para auditoria e invalidação.

Detalhes e demonstração em `back-atelie-no-de-afeto/REDIS.md`.

Para inspecionar:

```bash
docker exec -it nda_redis redis-cli KEYS "atelie:*"
docker exec -it nda_redis redis-cli PSUBSCRIBE "atelie:*"
```

---

## Documentação

| Documento | Conteúdo |
|---|---|
| `docs/DOCUMENTACAO.md` | Contextualização, requisitos, DER, casos de uso, diagramas |
| `docs/ARQUITETURA.md` | C4, ADRs, cenários de qualidade, DDD estratégico e tático |
| `docs/OPERACAO.md` | SLIs e SLOs, resiliência, plano de observabilidade |
| `docs/RUNBOOK.md` | Procedimentos de incidente e estratégia de reversão |
| `docs/GESTAO.md` | Análise Cynefin, abordagem, Product Backlog, versionamento |

---

## Comandos úteis

```bash
# Logs do backend
docker compose logs -f backend

# Entrar no banco
docker exec -it nda_db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" nos_de_afeto'

# Repovoar os dados de exemplo
docker exec -it nda_backend npx prisma db seed

# Limpar o cache
docker exec -it nda_redis redis-cli FLUSHDB

# Testes end-to-end
npx cypress run --browser electron
```

> `docker compose down -v` apaga os volumes — banco e imagens enviadas vão
> junto. Para parar os containers preservando os dados, use
> `docker compose down` sem a flag.

---

## Licença

Projeto acadêmico, desenvolvido para a disciplina de Tecnologia em Análise e
Desenvolvimento de Sistemas.