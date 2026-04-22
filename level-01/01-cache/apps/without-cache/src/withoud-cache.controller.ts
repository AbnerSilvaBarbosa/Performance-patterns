import { Controller, Get, Logger, Query } from '@nestjs/common';
import { WithoudCacheService } from './withoud-cache.service';

@Controller('products')
export class WithoudCacheController {
  private readonly logger = new Logger(WithoudCacheController.name);

  constructor(private readonly withoudCacheService: WithoudCacheService) {}

  @Get()
  async getProducts(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedOffset = offset ? parseInt(offset, 10) : undefined;
    const start = Date.now();

    if (search) {
      this.logger.log(`GET /products?search=${search}`);
      const products = await this.withoudCacheService.searchProducts(search, parsedLimit, parsedOffset);
      this.logger.log(`GET /products?search=${search} — ${products.length} items — ${Date.now() - start}ms`);
      return products;
    }

    this.logger.log('GET /products');
    const products = await this.withoudCacheService.getProducts(parsedLimit, parsedOffset);
    this.logger.log(`GET /products — ${products.length} items — ${Date.now() - start}ms`);
    return products;
  }
}
