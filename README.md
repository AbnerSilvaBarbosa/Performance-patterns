# NestJS Performance Patterns

Repositório de estudos sobre **padrões de performance, escalabilidade e arquiteturas** em aplicações backend, comparando diferentes técnicas, инструменты e tecnologias.

## 🏗️ Visão Geral

Este projeto demonstra como resolver problemas reais de escalabilidade que a gente encontra no mercado:
- Alta concorrência
-瓶颈 de banco de dados
- Cache estratégias
- Processamento em batch
- Message queues
- Microsserviços

Cada **level** é um caso de uso diferente, com código real, testes de carga e métricas.

## 📚 Levels

| Level | Tema | Stack | Status |
|-------|------|-------|--------|
| 01 | Cache com Redis | NestJS + PostgreSQL + Redis | ✅ Pronto |
| 02 | Batch Processing | NestJS + BullMQ | 🔜 Em breve |
| 03 | Connection Pooling | NestJS + PostgreSQL | 🔜 Em breve |
| 04 | Query Optimization | PostgreSQL + Drizzle | 🔜 Em breve |
| 05 | CQRS Pattern | NestJS + Event Store | 🔜 Em breve |
| 06 | API Gateway | NestJS + API Gateway | 🔜 Em breve |
| 07 | Message Queue | NestJS + RabbitMQ/Kafka | 🔜 Em breve |
| 08 | Microservices | NestJS + gRPC | 🔜 Em breve |
| 09 | GraphQL | NestJS + Apollo | 🔜 Em breve |
| 10 | WebSockets | NestJS + Socket.io | 🔜 Em breve |

### 🎯 Level 01: Search Products (Cache) — PRONTO

**Problema do mercado**:
> "Milhares de usuários acessando a página inicial ao mesmo tempo, todos buscando os mesmos produtos em destaque. Cada request vai direto no banco, que fica sobrecarregado."

**Stack**:
- NestJS (monorepo)
- PostgreSQL (Drizzle ORM)
- Redis (cache)
- k6 (load testing)
- Prometheus + Grafana (monitoramento)

**Resultado medido**:
| Métrica | Sem Cache | Com Cache | Melhoria |
|--------|-----------|------------|-----------|
| Response Time | 1.77ms | 1.21ms | **31.7%** |
| Stress (500 VUs) | 2.15ms | 1.05ms | **51.2%** |
| Throughput | ~500 req/s | ~2000 req/s | **4x** |
| DB CPU | 70-90% | 5-10% | **▼ 85%** |

---

## 🚀 Quick Start (Level 01)

### Prerequisites

- Node.js 20+
- Docker e Docker Compose
- k6 instalado (`brew install k6` ou [instruções](https://grafana.com/docs/k6/latest/set-up/install-k6/))

### Setup Completo

```bash
cd level-01/01-search-products

# 1. Instalar dependências
npm install

# 2. Subir infraestrutura
docker compose up -d

# 3. Criar banco
npm run db:generate
npm run db:migrate

# 4. Popular (100k produtos)
npm run db:seed

# 5. Rodar app (escolha um)
nest start without-cache --watch  # SEM cache
nest start with-cache --watch    # COM cache

# 6. Testar carga
npm run k6:load
```

### Comparando Cache vs Sem Cache

```bash
# --- SEM CACHE ---
# Terminal 1
nest start without-cache --watch

# Terminal 2
k6 run k6/load.js --out json=k6/results/load-without-cache.json

# --- COM CACHE ---
# Terminal 1 (outra porta)
nest start with-cache --watch

# Terminal 2
BASE_URL=http://localhost:3001 k6 run k6/load.js --out json=k6/results/load-with-cache.json

# --- COMPARAR ---
./k6/compare.sh compare
```

---

## 📊 Monitoramento

Após `docker compose up -d`:

| Serviço | URL | Usuário |
|---------|-----|--------|
| Grafana | http://localhost:3030 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| pgAdmin | http://localhost:5050 | postgres/postgres |
| Redis Insight | http://localhost:5540 | - |

Dashboards disponíveis:
- API Metrics (requisões, latency, errors)
- PostgreSQL (queries, connections, wal)
- Redis (memory, commands, keys)
- k6 Results (throughput, latency)

---

## 🛠️ Stack Tecnológica

### Backend
| Tech | Uso | Por Que |
|------|-----|--------|
| NestJS | Framework | Opinionated, DI, Modules |
| Express/Fastify | HTTP | Fastify mais rápido para JSON |
| Drizzle ORM | DB | Type-safe, leve |
| PostgreSQL | Banco | Robust, ACID |
| Redis | Cache | In-memory, sub-ms |

### Observability
| Tech | Uso | Por Que |
|------|-----|--------|
| Prometheus | Métricas | Padrão CNCF |
| Grafana | Dashboards | Visualization |
| k6 | Load Test | Scriptable, JS |
| pino | Logging | JSON,structured |

### DevOps
| Tech | Uso |
|------|-----|
| Docker | Container |
| Docker Compose | Multi-service |

---

## 📂 Estrutura do Repositório

```
nestjs-performance-patterns/
├── level-01/
│   └── 01-search-products/
│       ├── apps/
│       │   ├── with-cache/      # App + Redis
│       │   └── without-cache/ # App direto no DB
│       ├── libs/
│       │   ├── cache/        # Cache lib
│       │   ├── database/     # DB lib
│       │   └── metrics/     # Metrics lib
│       ├── k6/
│       │   ├── smoke.js    # Sanity check
│       │   ├── load.js    # Carga normal
│       │   ├── stress.js  # Limite
│       │   ├── spike.js  # Pico
│       │   ├── compare.sh # Comparador
│       │   └── RESULTS.md
│       └── monitoring/
├── level-02/ (em breve)
├── level-03/ (em breve)
└── README.md
```

---

## 🤓 Como Contribuir

1. Clone o repo
2. Crie uma branch `level-XX-feature`
3. Adicione código + testes
4. Documente resultados
5. Pull request

### Adicionando Novo Level

```
level-XX/
├── README.md              # Explica o problema
├── apps/                # App NestJS
├── libs/                # libs necessárias
├── k6/                # Testes de carga
└── docker-compose.yml    # infra se preciso
```

---

## 📖 Recursos

### Livros
- "Designing Data-Intensive Applications" - Martin Kleppmann
- "High Performance MySQL" - Schwartz et al.
- "The Art of Scalability" - Abbott & Fisher

### Artigos
- [Redis Cache Patterns](https://redis.io/docs/)
- [k6 Best Practices](https://k6.io/docs/)
- [NestJS Performance](https://docs.nestjs.com/techniques/performance)

### Videos
- [Build Micro-services That Scale](https://www.youtube.com/watch?v=...)
- [k6 Load Testing Masterclass](https://www.youtube.com/watch?...)

---

## 📈 Métricas de Referência

| Métrica | Bom | Ruim |
|--------|-----|------|
| p95 latency | < 200ms | > 500ms |
| error rate | < 1% | > 5% |
| cache hit rate | > 90% | < 70% |
| CPU app | < 50% | > 80% |
| CPU DB | < 30% | > 70% |

---

## FAQ

### "Preciso saber tudo isso?"

Não. Cada level é independente. Escolha o seu problema e estude só ele.

### "Posso usar outro banco?"

Sim. A arquitetura é a mesma. Troque PostgreSQL por MySQL/Mongo se quiser.

### "E se não tenho Redis?"

Sem cache, as outras estratégias (CDN, aplicação em cache) funcionam diferente, mas a lógica de medição é a mesma.

---

## 📜 Licença

MIT — Livre para usar, modificar e distribuir.

---

## 🙏 Créditos

Feito com ☕ para estudo próprio e da comunidade.

**Quer resolver um problema de performance?** Abra uma issue com o cenário que a gente cria um level pra isso.