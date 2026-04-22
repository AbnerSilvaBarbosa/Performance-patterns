import { Module } from '@nestjs/common';
import { WithCacheController } from './with-cache.controller';
import { WithCacheService } from './with-cache.service';
import { DatabaseModule } from '@app/database';
import { CacheModule } from '@app/cache';
import { MetricsModule } from '@app/metrics';
import { MetricsInterceptor } from '@app/metrics';

@Module({
  imports: [DatabaseModule, CacheModule, MetricsModule],
  controllers: [WithCacheController],
  providers: [WithCacheService, MetricsInterceptor],
})
export class WithCacheModule {}
