# Métricas e Fluxo de Observabilidade

## Como os dados chegam ao Grafana

```
PostgreSQL ──► postgres_exporter ──┐
                                   ├──► Prometheus ──► Grafana
Redis      ──► redis_exporter   ──┘
                                   
k6 ─────────────────────────────────► Prometheus (remote write)
```

### Passo a passo do fluxo

1. **Exporters** ficam rodando como sidecars ao lado do PostgreSQL e Redis. Eles conversam com cada serviço via protocolo nativo (SQL e RESP) e expõem as métricas em formato Prometheus em um endpoint HTTP (`/metrics`).

2. **Prometheus** faz _scrape_ (coleta) nesses endpoints a cada 15 segundos, armazena os valores em sua série temporal local e os disponibiliza via PromQL.

3. **k6** envia as métricas diretamente ao Prometheus via _remote write_ (`--out experimental-prometheus-rw`) em tempo real, durante a execução dos testes.

4. **Grafana** consulta o Prometheus via PromQL e renderiza os dashboards. O datasource e os dashboards são provisionados automaticamente na primeira subida — zero configuração manual.

---

## Dashboard: PostgreSQL

Alimentado pelo `prometheuscommunity/postgres-exporter` (porta 9187).

### Conexões e sessões

| Painel | O que mostra |
|--------|-------------|
| **Active sessions** | Quantidade de conexões em estado `active` — executando uma query agora. Pico alto indica gargalo de concorrência. |
| **Idle sessions** | Conexões abertas mas ociosas (`idle`, `idle in transaction`). Muitas conexões idle consomem recursos sem retorno. |
| **Max Connections** | Limite configurado no PostgreSQL. Se `active + idle` se aproximar desse valor, novas conexões serão recusadas. |

### Throughput de dados

| Painel | O que mostra |
|--------|-------------|
| **Fetch data (SELECT)** | Linhas retornadas por queries SELECT acumuladas. Crescimento constante é esperado — spike repentino pode indicar query sem filtro. |
| **Return data** | Linhas varridas pelo banco para satisfazer queries. Se muito maior que Fetch, o banco está lendo mais do que entregando — índice faltando. |
| **Insert data** | Volume de inserções. Útil para monitorar seeds, imports e escritas da aplicação. |
| **Update data** | Volume de atualizações. |
| **Delete data** | Volume de deleções. |

### Transações

| Painel | O que mostra |
|--------|-------------|
| **Transactions** | Taxa de commits por segundo (`irate`). Mede a saúde geral do throughput transacional. |
| **Conflicts / Deadlocks** | Conflitos entre transações concorrentes. Qualquer valor acima de zero merece investigação. |

### Cache e memória

| Painel | O que mostra |
|--------|-------------|
| **Cache Hit Rate** | Proporção de blocos lidos do cache (shared buffers) vs. disco. Ideal acima de 99%. Queda indica que o banco está indo ao disco com frequência. |
| **Shared Buffers** | Tamanho do cache de páginas em memória configurado no PostgreSQL. |
| **Buffers (bgwriter)** | Buffers escritos pelo background writer. Alto volume pode indicar pressão de memória. |

### Configurações e infraestrutura

| Painel | O que mostra |
|--------|-------------|
| **Work Mem** | Memória disponível por operação de sort/hash. Valor baixo gera arquivos temporários. |
| **Temp File (Bytes)** | Volume de dados escritos em disco por operações que excederam o `work_mem`. Sempre ruim — indica falta de memória ou queries pesadas. |
| **Lock tables** | Locks ativos por modo (row exclusive, share, etc). Locks prolongados travam outras operações. |
| **Checkpoint Stats** | Tempo gasto em checkpoints. Checkpoints frequentes ou longos indicam volume alto de WAL. |
| **Average CPU / Memory Usage** | CPU e memória consumidos pelo processo do PostgreSQL. |

---

## Dashboard: Redis

Alimentado pelo `oliver006/redis_exporter` (porta 9121).

### Visão geral

| Painel | O que mostra |
|--------|-------------|
| **Uptime** | Tempo desde o último restart. Restart inesperado indica crash ou OOM. |
| **Clients** | Conexões ativas ao Redis. |
| **Memory Usage (%)** | Percentual da memória máxima configurada (`maxmemory`) em uso. Acima de 80% começa a ser crítico. |
| **Total Memory Usage** | Bytes absolutos em uso pelo Redis. |

### Performance

| Painel | O que mostra |
|--------|-------------|
| **Commands Executed / sec** | Taxa total de comandos processados. Métrica central de throughput do Redis. |
| **Command Calls / sec** | Top 5 comandos mais executados (GET, SET, etc). Mostra o que a aplicação mais usa. |
| **Hits / Misses per sec** | Taxa de acertos e erros no cache. Hit rate baixo significa que as chaves não estão no Redis quando a aplicação pede — cache ineficiente ou TTL muito curto. |

### Keyspace

| Painel | O que mostra |
|--------|-------------|
| **Total Items per DB** | Total de chaves por database do Redis. |
| **Expiring vs Not-Expiring Keys** | Quantas chaves têm TTL definido vs. vivem para sempre. Muitas chaves sem TTL podem encher a memória indefinidamente. |
| **Expired / Evicted** | Taxa de chaves expiradas (TTL vencido) e evictadas (Redis removeu por pressão de memória). Evictions altas indicam que o Redis está sem espaço. |

### Rede

| Painel | O que mostra |
|--------|-------------|
| **Network I/O** | Bytes de entrada e saída por segundo. Útil para identificar payloads grandes sendo trafegados. |

---

## Dashboard: k6

Alimentado diretamente pelo k6 via Prometheus remote write durante a execução dos testes.

### Requisições

| Painel | O que mostra |
|--------|-------------|
| **HTTP Request Rate** | Requisições por segundo sendo enviadas. Reflete diretamente o número de VUs ativos. |
| **HTTP Request Duration** | Tempo de resposta das requisições. Geralmente exibido como p50, p95 e p99. |
| **p95 / p99 Latency** | 95% e 99% das requisições responderam dentro desse tempo. p95 é o threshold principal do projeto (< 500ms no load test). |
| **HTTP Request Failed** | Taxa de erros HTTP (status 4xx/5xx). Threshold: < 1% no load test, < 5% no stress test. |

### Execução

| Painel | O que mostra |
|--------|-------------|
| **Active VUs** | Usuários virtuais ativos em cada momento. Reflete as stages configuradas (ramp up, sustentado, ramp down). |
| **Iterations** | Ciclos completos do script executados. Cada iteração = 1 passagem pelo `export default function`. |
| **Iteration Duration** | Tempo médio de uma iteração completa (requests + sleeps). |

### Checks

| Painel | O que mostra |
|--------|-------------|
| **Checks Passed / Failed** | Resultado dos `check()` definidos no script: status 200, response < 500ms, body is array. |

---

## Thresholds configurados por cenário

| Cenário | p95 | p99 | Taxa de erro |
|---------|-----|-----|-------------|
| Smoke   | < 500ms | < 1000ms | < 1% |
| Load    | < 500ms | < 1000ms | < 1% |
| Stress  | < 1000ms | < 2000ms | < 5% |
| Spike   | < 2000ms | — | < 10% |

Se algum threshold for ultrapassado, o k6 encerra com código de saída diferente de zero — útil para CI/CD reprovar o build automaticamente.
