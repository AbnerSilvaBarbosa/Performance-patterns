import { DrizzleAsyncProvider } from '@app/database/drizzle.provider';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from "@app/database/schema";
import { Product } from "@app/database/schema";
import { ilike } from 'drizzle-orm';

const DEFAULT_LIMIT = 100;

@Injectable()
export class WithoudCacheService {

  constructor(@Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof sc>) {}

  async getProducts(limit: number = DEFAULT_LIMIT, offset: number = 0): Promise<Product[]> {
    return this.db.select().from(sc.products).limit(limit).offset(offset);
  }

  async searchProducts(query: string, limit: number = DEFAULT_LIMIT, offset: number = 0): Promise<Product[]> {
    return this.db
      .select()
      .from(sc.products)
      .where(ilike(sc.products.name, `%${query}%`))
      .limit(limit)
      .offset(offset);
  }
}
