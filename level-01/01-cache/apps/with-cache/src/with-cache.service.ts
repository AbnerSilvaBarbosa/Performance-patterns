import { DrizzleAsyncProvider } from '@app/database/drizzle.provider';
import { CacheService } from '@app/cache';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from "@app/database/schema";
import { Product } from "@app/database/schema";
import { ilike } from 'drizzle-orm';

const DEFAULT_LIMIT = 100;

@Injectable()
export class WithCacheService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof sc>,
    private cacheService: CacheService,
  ) {}

  async getProducts(limit: number = DEFAULT_LIMIT, offset: number = 0): Promise<Product[]> {
    const cacheKey = `products:list:${limit}:${offset}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () => this.db.select().from(sc.products).limit(limit).offset(offset),
      300,
    );
  }

  async searchProducts(
    query: string,
    limit: number = DEFAULT_LIMIT,
    offsetVal: number = 0,
  ): Promise<Product[]> {
    const cacheKey = `products:search:${query}:${limit}:${offsetVal}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () =>
        this.db
          .select()
          .from(sc.products)
          .where(ilike(sc.products.name, `%${query}%`))
          .limit(limit)
          .offset(offsetVal),
      300,
    );
  }
}