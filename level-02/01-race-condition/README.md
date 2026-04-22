# Level 02 - Desafio 01: Race Condition no Estoque

## Problema CLÁSSICO

Produto tem 1 unidade em estoque. 3 usuários clicam em "comprar" no mesmo milissegundo.

Seu código faz:
1. Verifica estoque: tem 1 unidade ✅
2. Cria pedido
3. Decrementa estoque

**Resultado**: Os 3 passam na verificação antes de qualquer um decrementar. **3 pedidos criados, 1 produto!**

## Sintomas

- Estoque negativo no banco
- Clientes comprando produtos indisponíveis
- Reclamações e reembolsos

## Solução: Transações Atômicas + Locks

### Opção 1: Pessimistic Lock (SELECT FOR UPDATE)

```typescript
async function buyProduct(userId: string, productId: string) {
  return await db.transaction(async (tx) => {
    // Bloqueia a linha até a transação terminar
    const product = await tx.products.findUnique({
      where: { id: productId },
      select: { stock: true },
      forUpdate: true, // SELECT FOR UPDATE
    });
    
    if (!product || product.stock < 1) {
      throw new Error('Sem estoque');
    }
    
    // Atualiza após ter a lock
    await tx.products.update({
      where: { id: productId },
      data: { stock: { decrement: 1 } },
    });
    
    await tx.orders.create({ userId, productId });
  });
}
```

### Opção 2: Optimistic Lock (Version Column)

```sql
-- Tabela tem coluna version
ALTER TABLE products ADD COLUMN version INT DEFAULT 0;
```

```typescript
async function buyProduct(userId: string, productId: string) {
  const result = await tx.products.updateMany({
    where: {
      id: productId,
      stock: { gt: 0 },
      version: currentVersion,
    },
    data: {
      stock: { decrement: 1 },
      version: { increment: 1 },
    },
  });
  
  // Se ninguém atualizou, retorna 0 = falhou
  if (result.count === 0) {
    throw new Error('Sem estoque ou versão inválida');
  }
}
```

### Opção 3: Operações Atômicas (Recomendado)

```typescript
async function buyProduct(userId: string, productId: string) {
  // Atualiza atomicamente, só se stock > 0
  const result = await db.products.updateMany({
    where: {
      id: productId,
      stock: { gt: 0 },
    },
    data: {
      stock: { decrement: 1 },
    },
  });
  
  if (result.count === 0) {
    throw new Error('Sem estoque');
  }
  
  await db.orders.create({ userId, productId });
}
```

## Estrutura

```
level-02/01-race-condition/
├── apps/
├── libs/
├── k6/
└── docker-compose.yml
```

## Comparação

| Técnica | Complexidade | Throughput | Uso |
|---------|------------|-----------|-----------|
| Pessimistic Lock | Média | Baixo | Estoque crítico |
| Optimistic Lock | Alta | Alto | Versões frequentes |
| Atomic Update | Baixa | Alto | **Mais comum** |