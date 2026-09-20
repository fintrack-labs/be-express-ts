import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const prefix = process.env.API_PREFIX;
  if (prefix && prefix.trim() !== '') {
    app.setGlobalPrefix(prefix);
  }

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 8080);
  await app.listen(port, '0.0.0.0');
}
await bootstrap();

