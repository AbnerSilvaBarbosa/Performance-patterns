# Testes de carga — k6

Cada arquivo representa um cenário diferente. Rode sempre na ordem abaixo para garantir que a API está estável antes de aumentar a pressão.

---

## Arquivos

### `config.js`
Configurações compartilhadas entre todos os cenários:
- `BASE_URL` — padrão `http://localhost:3000`, sobrescrito via `BASE_URL=...`
- `thresholds` — critérios de aprovação: p95 < 500ms, taxa de erro < 1%

### `helpers.js`
Funções reutilizáveis usadas pelos cenários:
- `getProducts()` — faz `GET /products` e valida status, tempo e corpo
- `searchProducts(query)` — faz `GET /products?search=...`
- `randomSearchTerm()` — retorna um termo aleatório da lista de produtos

---

## Cenários

### `smoke.js` — Sanity Check
**Quando usar:** sempre primeiro, antes de qualquer outro teste.

Sobe 1 VU por 30 segundos. O objetivo não é medir performance, é confirmar que a API está de pé, as rotas existem e o banco está respondendo.

```bash
npm run k6:smoke
```

---

### `load.js` — Carga Normal
**Quando usar:** após o smoke passar, para medir o comportamento em uso real.

| Fase | Duração | VUs |
|------|---------|-----|
| Ramp up | 1 min | 0 → 50 |
| Sustentado | 3 min | 50 |
| Ramp down | 1 min | 50 → 0 |

60% das requisições são listagem geral, 40% são buscas por termo.

```bash
npm run k6:load
```

---

### `stress.js` — Estresse
**Quando usar:** para encontrar o ponto de ruptura da aplicação.

Aumenta a carga em escada até 200 VUs, mantendo cada nível por 2 minutos para observar o comportamento sob pressão prolongada. Os thresholds são mais relaxados (p95 < 1s) porque o objetivo é observar degradação, não reprovar o teste.

| Fase | VUs |
|------|-----|
| Escada 1 | 50 |
| Escada 2 | 100 |
| Escada 3 | 150 |
| Escada 4 | 200 |

```bash
npm run k6:stress
```

---

### `spike.js` — Pico repentino
**Quando usar:** para simular um evento de tráfego inesperado (campanha, viral).

Parte de 5 VUs e salta para 300 em 30 segundos, mantém por 1 minuto, depois volta ao normal. Testa a capacidade da aplicação de se recuperar após um pico.

```bash
npm run k6:spike
```

---

## Resultados

Os JSONs gerados ficam em `results/` (gitignored). Para visualizar graficamente, importe no [Grafana k6 Dashboard](https://grafana.com/grafana/dashboards/2587).

## Comparando with-cache vs without-cache

Suba cada serviço na sua vez e rode o mesmo cenário:

```bash
# Terminal 1
nest start without-cache --watch

# Terminal 2
npm run k6:load
# salva resultado, depois troca o serviço e repete
```

Para rodar os dois ao mesmo tempo em portas diferentes:

```bash
# Terminal 1 — porta 3000
nest start without-cache --watch

# Terminal 2 — porta 3001 (configure PORT=3001 no .env ou no main.ts)
nest start with-cache --watch

# Terminal 3 — testa without-cache
npm run k6:load

# Terminal 4 — testa with-cache
BASE_URL=http://localhost:3001 k6 run k6/load.js
```
