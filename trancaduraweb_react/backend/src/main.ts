// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as cors from 'cors';

import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: configService.get('CORS_ORIGIN') || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Prisma shutdown hook
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}/api`);
}

bootstrap();
