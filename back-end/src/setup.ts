import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { RawServerDefault } from 'fastify';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { fastifyCookie } from '@fastify/cookie';
import { fastifySession } from '@fastify/session';
import { sessionConfig } from './core/config/session.config';
import { PrismaSessionStore } from './core/session/session.store';
import { PrismaService } from './core/service/prisma.service';
import { sessionUserMiddleware } from './core/middleware/session-user.middleware';
import { HttpAdapterHost } from '@nestjs/core';
import { LocalizedHttpExceptionFilter } from './core/filters/localized-http-exception.filter';
import {
  getApiLanguage,
  translateApiMessage,
} from './core/i18n/error-translations';
import { PrismaQueryContextInterceptor } from './core/database/prisma-query-context.interceptor';

export async function setup(app: NestFastifyApplication<RawServerDefault>) {
  // Add any setup logic here

  await app.register(multipart, {
    limits: { files: 21, fileSize: 10 * 1024 * 1024, fields: 1 },
  });

  await app.register(rateLimit, {
    global: true,
    max: 8000, // 100 requests
    timeWindow: '15 minute', // per minute, per IP
    errorResponseBuilder: (request, context) => {
      const language = getApiLanguage(request.headers['accept-language']);
      return {
        statusCode: 429,
        error: translateApiMessage('Too Many Requests', language),
        message: `${translateApiMessage('Rate limit exceeded', language)}, ${translateApiMessage('retry in', language)} ${context.after}`,
      };
    },
  });

  // Cookie
  await app.register(fastifyCookie);
  // Session
  await app.register(fastifySession, {
    secret: sessionConfig.secret,
    cookieName: sessionConfig.cookieName,
    cookie: {
      path: sessionConfig.cookie.path,
      httpOnly: sessionConfig.cookie.httpOnly,
      secure: sessionConfig.cookie.secure,
      sameSite: sessionConfig.cookie.sameSite,
      maxAge: sessionConfig.ttl,
    },
    saveUninitialized: false,
    rolling: true,
    store: new PrismaSessionStore(app.get(PrismaService)),
  });
  // Attach the session user to the request
  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onRequest', sessionUserMiddleware(app.get(PrismaService)));

  // ✅ Global prefix (optional)
  app.setGlobalPrefix('api');

  // ✅ CORS
  app.enableCors({
    origin: true, // Change to your domain in production
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Accept-Language',
      'X-Requested-With',
    ],
  });

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO types
    }),
  );

  app.useGlobalFilters(
    new LocalizedHttpExceptionFilter(app.get(HttpAdapterHost)),
  );
  if (process.env.NODE_ENV === 'dev') {
    app.useGlobalInterceptors(new PrismaQueryContextInterceptor());
  }

  // ✅ Enable graceful shutdown
  app.enableShutdownHooks();
}
