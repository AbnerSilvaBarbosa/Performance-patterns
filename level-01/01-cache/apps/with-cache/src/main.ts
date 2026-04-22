import { NestFactory } from '@nestjs/core';
import { WithCacheModule } from './with-cache.module';

async function bootstrap() {
  const app = await NestFactory.create(WithCacheModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
