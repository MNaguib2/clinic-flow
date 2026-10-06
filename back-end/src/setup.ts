import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { RawServerDefault } from 'fastify';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from '@fastify/rate-limit';

export async function setup(app: NestFastifyApplication<RawServerDefault>) {
  // Add any setup logic here

  await app.register(rateLimit, {
    global: true,
    max: 8000, // 100 requests
    timeWindow: '15 minute', // per minute, per IP
    errorResponseBuilder: (_req, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `🚫 Rate limit exceeded, retry in ${context.after}`,
    }),
  });

  // ✅ Global prefix (optional)
  app.setGlobalPrefix('api');

  // ✅ CORS
  app.enableCors({
    origin: '*', // Change to your domain in production
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO types
    }),
  );

  // ✅ Enable graceful shutdown
  app.enableShutdownHooks();
}
