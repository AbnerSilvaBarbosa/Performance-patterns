# Level 01 - Desafio 02: Cache Warming

## Problema

Quando seu servidor reinicia (deploy, crash, etc), o Redis está vazio. Os primeiros milhares de usuários sofrem com cache MISS, sobrecarregando o DB novamente até o cache "esquentar".

## Sintomas

- Primeiros 2-3 minutos após deploy são críticos
- Alertas de DB overload
- Usuários reclamam de lentidão logo após atualização

## Solução: Pre-warming Strategy

### Como resolver

1. Crie um serviço de "aquecimento" que rodar ao iniciar a aplicação
2. Identifique os dados mais acessados (top 100 produtos, categorias principais)
3. Antes de aceitar tráfego, carregue esses dados no Redis
4. Use health check para só marcar serviço como "ready" após warming
5. Considere manter um cache secundário persistente (Redis com AOF/RDB)

### Estratégias avanzadas

- Aquecer baseado em analytics (produtos mais vistos nas últimas 24h)
- Cache hierárquico: local (in-memory) + Redis + CDN
- Blue-green deployment para manter cache quente

## Estrutura

```
level-01/02-cache-warming/
├── apps/
│   ├── with-warming/     # App com cache warming
│   └── without-warming/ # App sem warming (baseline)
├── libs/
├── k6/
└── docker-compose.yml
```