# Level 01 - Desafio 03: Query N+1

## Problema

Você lista 50 produtos na home, cada produto tem uma categoria. Seu código faz:

- 1 query para buscar 50 produtos
- 50 queries para buscar a categoria de cada produto
- **Total: 51 queries para renderizar uma página!**

## Sintomas

- Response time alto mesmo com poucos usuários
- Logs mostram centenas de queries SQL
- DB tem muitas queries rápidas mas em volume absurdo

## Solução: Eager Loading / DataLoader Pattern

### Antes (N+1)

```typescript
const products = await db.select().from(products).limit(50);
// Para cada produto, buscar categoria
for (const product of products) {
  product.category = await db.select().from(categories).where({ id: product.categoryId });
}
// Total: 51 queries
```

### Depois (Eager Loading)

```typescript
const products = await db.select()
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .limit(50);
// Total: 1 query com JOIN
```

### DataLoader Pattern

```typescript
// Agrupa todas as IDs necessárias
const categoryIds = products.map(p => p.categoryId);
const categories = await db.select()
  .from(categories)
  .where(inArray(categories.id, categoryIds));

// Mapeia em memória
const categoryMap = new Map(categories.map(c => [c.id, c]));
// Total: 2 queries (products + categories)
```

## Estrutura

```
level-01/03-query-n-plus-1/
├── apps/
├── libs/
├── k6/
└── docker-compose.yml
```

## Métricas Esperadas

| Abordagem | Queries | Tempo |
|----------|--------|-------|
| N+1 | 51 | ~500ms |
| JOIN | 1 | ~20ms |
| DataLoader | 2 | ~25ms |