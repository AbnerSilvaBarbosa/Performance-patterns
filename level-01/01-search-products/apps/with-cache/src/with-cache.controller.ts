import { Controller, Get, Logger, Query, UseInterceptors } from '@nestjs/common';
import { WithCacheService } from './with-cache.service';
import { MetricsInterceptor } from '@app/metrics';

@Controller('products')
@UseInterceptors(MetricsInterceptor)
export class WithCacheController {
  private readonly logger = new Logger(WithCacheController.name);

  constructor(private readonly withCacheService: WithCacheService) {}

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
      this.logger.log(`GET /products?search=${search} (with cache)`);
      const products = await this.withCacheService.searchProducts(search, parsedLimit, parsedOffset);
      this.logger.log(`GET /products?search=${search} — ${products.length} items — ${Date.now() - start}ms (cache)`);
      return products;
    }

    this.logger.log('GET /products (with cache)');
    const products = await this.withCacheService.getProducts(parsedLimit, parsedOffset);
    this.logger.log(`GET /products — ${products.length} items — ${Date.now() - start}ms (cache)`);
    return products;
  }
}