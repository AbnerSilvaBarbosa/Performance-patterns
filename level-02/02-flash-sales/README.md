# Level 02 - Desafio 02: Vendas Relâmpago (Flash Sales)

## Problema

Black Friday, 10 mil usuários tentando comprar 100 iPhones em promoção ao mesmo tempo. Sistema colapsa.

## Sintomas

- Site cai completamente
- Timeouts em massa
- DB connections esgotadas
- Alguns conseguem comprar, maioria vê erro 500

## Solução: Sistema de Fila (Queue)

### Arquitetura

```
User → API (enfileira) → Queue → Workers (processa) → DB
                                   → Notify (email/push)
```

### Implementação

#### 1. Enfileirar pedido (rápido)

```typescript
// POST /orders
async function createOrder(dto: CreateOrderDto) {
  // Gera position na fila
  const order = await queue.add('process-order', {
    userId: dto.userId,
    productId: dto.productId,
  }, {
    removeOnComplete: true,
    removeOnFail: false,
  });
  
  return {
    status: 'queued',
    orderId: order.id,
    position: await queue.getJobCount(),
  };
}
```

#### 2. Worker processa (controlado)

```typescript
// process.ts
@Process('process-order', { concurrency: 10 })
async function handleOrder(job: Job) {
  const { productId, userId } = job.data;
  
  // Verifica estoque atomicamente
  const updated = await db.products.updateMany({
    where: {
      id: productId,
      stock: { gt: 0 },
    },
    data: {
      stock: { decrement: 1 },
    },
  });
  
  if (updated.count === 0) {
    return { status: 'failed', reason: 'sem_estoque' };
  }
  
  const order = await db.orders.create({
    userId,
    productId,
    status: 'confirmed',
  });
  
  return { status: 'success', orderId: order.id };
}
```

#### 3. WebSocket notificação

```typescript
// Após processar, notifica usuário
io.to(userId).emit('order-processed', {
  orderId: order.id,
  status: 'confirmed',
});
```

## Benefícios

- API nunca cai (só enfileira)
- DB não sobrecarrega (workers controlado)
- Usuário tem feedback (posição na fila)
- Experiência justa (FIFO)

## Estrutura

```
level-02/02-flash-sales/
├── apps/
│   ├── api/           # Enfileira
│   └── worker/       # Processa
├── libs/
├── k6/
└── docker-compose.yml  # RabbitMQ/Redis
```

## Métricas

| Métrica | Sem Fila | Com Fila |
|--------|---------|----------|
| Queda | Sim | Não |
| DB connections | 10000+ | 10-50 |
| Throughput | 50 req/s | 2000+ |
| Sucesso | 1% | 100% |