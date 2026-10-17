import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  getApiLanguage,
  translateApiMessage,
} from '../i18n/error-translations';

@Catch()
export class LocalizedHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(LocalizedHttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const request = context.getRequest<{
      url: string;
      body?: unknown;
      lastDatabaseQuery?: string;
      headers: { 'accept-language'?: string | string[] };
    }>();
    const language = getApiLanguage(request.headers['accept-language']);
    const httpException =
      exception instanceof HttpException ? exception : undefined;
    const statusCode = httpException?.getStatus() ?? 500;
    const errorDetails =
      exception instanceof Error
        ? {
            name: exception.name,
            message: exception.message,
            stack: exception.stack,
          }
        : { name: 'UnknownException', message: String(exception) };

    const log_directory = join(process.cwd(), 'log');
    const log_entry = {
      timestamp: new Date().toISOString(),
      url: request.url,
      body: redactPasswords(request.body),
      databaseQuery: request.lastDatabaseQuery ?? null,
      exception: { ...errorDetails, statusCode },
    };

    try {
      await mkdir(log_directory, { recursive: true });
      await appendFile(
        join(log_directory, 'error.jsonl'),
        `${JSON.stringify(log_entry)}\n`,
        'utf8',
      );
    } catch (log_error) {
      this.logger.error(
        `Could not write error log: ${log_error instanceof Error ? log_error.message : String(log_error)}`,
      );
    }

    const responseBody = httpException?.getResponse() ?? {
      statusCode,
      message: 'Internal Server Error',
      error: 'Internal Server Error',
    };
    const body: Record<string, unknown> =
      typeof responseBody === 'string'
        ? { message: responseBody }
        : { ...(responseBody as Record<string, unknown>) };

    if (typeof body.message === 'string') {
      body.message = translateApiMessage(body.message, language);
    } else if (Array.isArray(body.message)) {
      body.message = body.message.map((message: any) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        typeof message === 'string'
          ? translateApiMessage(message, language)
          : message,
      );
    }
    if (typeof body.error === 'string') {
      body.error = translateApiMessage(body.error, language);
    }

    httpAdapter.reply(
      context.getResponse(),
      { ...body, statusCode },
      statusCode,
    );
  }
}

function redactPasswords(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactPasswords);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        /password/i.test(key) ? '[REDACTED]' : redactPasswords(nestedValue),
      ]),
    );
  }
  return value;
}
