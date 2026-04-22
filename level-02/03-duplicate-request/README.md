# Level 02 - Desafio 03: Duplicate Requests (Double Click)

## Problema

Usuário clica no botão "Finalizar Compra" duas vezes rápido (impaciência ou lag). Sistema cria 2 pedidos idênticos e cobra 2x no cartão.

## Sintomas

- Pedidos duplicados no banco
- Cobranças duplicadas
- Suporte lotado de reclamações

## Solução: Idempotency Keys

### Fluxo

```
Request 1: key=ABC123 → processa → salva resultado
Request 2: key=ABC123 → retorna resultado salvo (duplicate)
Request 3: key=XYZ789 → processa normalmente
```

### Implementação

#### 1. Frontend gera key

```typescript
// request.ts
const idempotencyKey = crypto.randomUUID();

await fetch('/orders', {
  method: 'POST',
  headers: {
    'Idempotency-Key': idempotencyKey,
  },
  body: JSON.stringify(order),
});
```

#### 2. Backend verifica e processa

```typescript
@Post()
async createOrder(
  @Headers('Idempotency-Key') key: string,
  @Body() dto: CreateOrderDto,
) {
  // 1. Verifica se já processou essa key
  const existing = await this.redis.get(`idem:${key}`);
  if (existing) {
    return JSON.parse(existing);
  }
  
  // 2. Processa o pedido
  const order = await this.orderService.create(dto);
  
  // 3. Salva key + resultado com TTL (24h)
  await this.redis.setex(`idem:${key}`, 86400, JSON.stringify(order));
  
  return order;
}
```

#### 3. Service completo

```typescript
@Injectable()
export class IdempotencyService {
  constructor(private redis: RedisService) {}
  
  async getOrProcess<T>(
    key: string,
    processFn: () => Promise<T>,
    ttlSeconds: number = 86400,
  ): Promise<T> {
    const existing = await this.redis.get(key);
    if (existing) {
      return JSON.parse(existing);
    }
    
    const result = await processFn();
    await this.redis.setex(key, ttlSeconds, JSON.stringify(result));
    return result;
  }
}

// Usage
const order = await idempotency.getOrProcess(
  `idem:${key}`,
  () => this.orderService.create(dto),
);
```

## Por que funciona

- Key única por ação, não por usuário
- TTL de 24h cobre janela de retrier
- Se dup, retorna cache (não reprocessa)
- idempotente: mesmo resultado toda vez

## TTL por tipo

| Dado | TTL | Por quê |
|------|-----|--------|
| Payments | 24h | Dispute window |
| Orders | 24-48h | Retry logic |
| Queries | 5-60s | Cache rápido |

## Estrutura

```
level-02/03-duplicate-request/
├── apps/
├── libs/
├── k6/
└── docker-compose.yml
```

## Teste

```typescript
// Simular double click
const [result1, result2] = await Promise.all([
  createOrder(dto),
  createOrder(dto), // duplicate
]);

// Com idempotency: result1.id === result2.id
// Sem idempotency: result1.id !== result2.id (2 pedidos!)
```