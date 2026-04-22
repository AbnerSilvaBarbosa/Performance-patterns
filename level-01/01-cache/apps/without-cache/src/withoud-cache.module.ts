import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WithoudCacheController } from './withoud-cache.controller';
import { WithoudCacheService } from './withoud-cache.service';
import { DatabaseModule } from '@app/database';
import { MetricsModule, MetricsInterceptor } from '@app/metrics';

@Module({
  imports: [DatabaseModule, MetricsModule],
  controllers: [WithoudCacheController],
  providers: [
    WithoudCacheService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class WithoudCacheModule {}
