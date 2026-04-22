# 01 - Search Products

Projeto de estudo comparando busca de produtos **com cache (Redis)** e **sem cache**, usando NestJS monorepo, Drizzle ORM e PostgreSQL.

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- k6 instalado — [instruções](https://grafana.com/docs/k6/latest/set-up/install-k6/)

## Setup completo (ordem de execução)

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Crie um `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/search_products
```

### 3. Baixar dashboards do Grafana (uma vez só)

```bash
./monitoring/download-dashboards.sh
```

### 4. Subir a infraestrutura

```bash
docker compose up -d
```

Serviços disponíveis após o compose:

| Serviço    | URL                       |
|------------|---------------------------|
| Grafana    | http://localhost:3030      |
| Prometheus | http://localhost:9090      |

Login do Grafana: `admin` / `admin`

### 5. Criar e aplicar migrations

```bash
npm run db:generate
npm run db:migrate
```

### 6. Popular o banco

```bash
npm run db:seed
```

### 7. Iniciar um dos serviços

Em um terminal, suba o serviço que deseja testar:

```bash
# sem cache
nest start without-cache --watch

# com cache (Redis)
nest start with-cache --watch
```

### 8. Rodar os testes de carga

Em outro terminal, rode os cenários do k6 na ordem recomendada:

```bash
# 1. sanity check — garante que a API está respondendo
npm run k6:smoke

# 2. carga normal — simula uso real
npm run k6:load

# 3. stress — encontra o limite da aplicação
npm run k6:stress

# 4. spike — simula pico repentino de tráfego
npm run k6:spike
```

Para comparar `with-cache` vs `without-cache`, repita os testes trocando o serviço no passo 6. Os resultados ficam em `k6/results/`.

### Comparando resultados (with-cache vs without-cache)

O fluxo completo para comparar os dois cenários:

#### 1. Sem Cache (porta 3000)

```bash
# Terminal 1: start app sem cache
nest start without-cache --watch

# Terminal 2: rode os testes
k6 run k6/smoke.js --out json=k6/results/smoke-without-cache.json
k6 run k6/load.js --out json=k6/results/load-without-cache.json
k6 run k6/stress.js --out json=k6/results/stress-without-cache.json
k6 run k6/spike.js --out json=k6/results/spike-without-cache.json
```

#### 2. Com Cache (porta 3001)

```bash
# Terminal 1: start app com cache (porta diferente)
nest start with-cache --watch

# Terminal 2: rode os testes
k6 run k6/smoke.js --out json=k6/results/smoke-with-cache.json
k6 run k6/load.js --out json=k6/results/load-with-cache.json
k6 run k6/stress.js --out json=k6/results/stress-with-cache.json
k6 run k6/spike.js --out json=k6/results/spike-with-cache.json
```

#### 3. Compare os resultados

```bash
./k6/compare.sh compare
```

Consulte [k6/RESULTS.md](./k6/RESULTS.md) para análise completa dos resultados.

> Veja [k6/README.md](./k6/README.md) para entender cada cenário de teste.

---

## Resetar e repopular tudo

Se precisar começar do zero (inclui resetar Grafana, Prometheus, Redis e PostgreSQL):

```bash
# 1. Derrubar serviços e remover volumes (cuidado: apaga todos os dados)
docker compose down -v

# 2. Subir novamente
docker compose up -d

# 3. Baixar dashboards do Grafana (importante após reset)
./monitoring/download-dashboards.sh

# 4. Criar schema no banco (se não existir)
npm run db:generate
npm run db:migrate

# 5. Popular banco (100k produtos)
npm run db:seed

# 6. Reiniciar a aplicação (sem cache)
nest start without-cache --watch

# 7.Rodar novamente os testes
npm run k6:smoke
```

## Estrutura do projeto

```
apps/
├── with-cache/       # app com cache Redis
└── without-cache/    # app sem cache

libs/
└── database/         # lib compartilhada
    └── src/
        ├── schemas/products/   # tabela de produtos
        ├── schema.ts
        ├── drizzle.provider.ts
        └── database.module.ts

k6/                   # testes de carga
├── smoke.js
├── load.js
├── stress.js
├── spike.js
├── config.js
├── helpers.js
└── results/          # JSONs gerados pelos testes
```
