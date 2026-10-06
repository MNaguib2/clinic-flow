import * as dotenv from 'dotenv';

// Must run before importing modules that read process.env at load time.
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'dev'}` }); // relative to CWD

import { readFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { setup } from './setup';

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync('./certs/localhost-key.pem'),
    cert: readFileSync('./certs/localhost-cert.pem'),
    allowHTTP1: true, // <-- هذا هو المكان الصحيح
  };

  // ✅ Create app with Fastify adapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      ...(httpsOptions
        ? { https: httpsOptions, http2: true, allowHTTP1: true }
        : {}),
      logger: true, // Enable Fastify logger
      trustProxy: true, // Trust proxy headers (needed behind Nginx, etc.)
    }),
  );

  await setup(app);

  // ✅ Start server
  const port = process.env.PORT ?? 3000;
  const host = '0.0.0.0'; // ⚠️ Required for Fastify

  await app.listen(port, host);

  const logger = new Logger('Bootstrap');
  const protocol = httpsOptions ? 'https' : 'http';
  logger.log(`🚀 Application running on ${protocol}://${host}:${port}/api`);
}

void bootstrap();
