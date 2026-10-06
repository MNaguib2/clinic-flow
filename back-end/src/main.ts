import 'dotenv/config';

import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const keyPath = process.env.TLS_KEY_PATH;
  const certPath = process.env.TLS_CERT_PATH;
  if (Boolean(keyPath) !== Boolean(certPath)) {
    throw new Error('TLS_KEY_PATH and TLS_CERT_PATH must be set together.');
  }

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !keyPath) {
    throw new Error('TLS_KEY_PATH and TLS_CERT_PATH are required in production.');
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (isProduction && !sessionSecret) {
    throw new Error('SESSION_SECRET is required in production.');
  }
  if (sessionSecret && sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters long.');
  }

  const adapter = new FastifyAdapter({
    http2: true,
    ...(keyPath && certPath
      ? {
          https: {
            allowHTTP1: true,
            key: readFileSync(keyPath),
            cert: readFileSync(certPath),
          },
        }
      : {}),
  });
  const app = await NestFactory.create(AppModule, adapter);
  const fastify = app.getHttpAdapter().getInstance();
  const effectiveSessionSecret =
    sessionSecret ?? randomBytes(32).toString('hex');

  if (!sessionSecret) {
    Logger.warn(
      'SESSION_SECRET is not set; sessions will expire when this process restarts.',
      'Bootstrap',
    );
  }

  await fastify.register(fastifyCookie);
  await fastify.register(fastifySession, {
    secret: effectiveSessionSecret,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: Boolean(keyPath),
    },
    saveUninitialized: false,
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap().catch((error: unknown) => {
  Logger.error('Application startup failed.', error, 'Bootstrap');
  process.exitCode = 1;
});
