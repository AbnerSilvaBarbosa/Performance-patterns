import { NestFactory } from '@nestjs/core';
import { WithoudCacheModule } from './withoud-cache.module';

async function bootstrap() {
  const app = await NestFactory.create(WithoudCacheModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
