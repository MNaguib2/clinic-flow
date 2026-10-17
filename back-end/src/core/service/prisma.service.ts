import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { prismaQueryContext } from '../database/prisma-query-context';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set.');
    }
    const is_dev = process.env.NODE_ENV === 'dev';

    super({
      adapter: new PrismaMariaDb(databaseUrl),
      ...(is_dev
        ? { log: [{ emit: 'event' as const, level: 'query' as const }] }
        : {}),
    });

    if (is_dev) {
      const clientWithQueryEvents = this as unknown as PrismaClient<'query'>;
      clientWithQueryEvents.$on('query', (event) => {
        const request = prismaQueryContext.getStore();
        if (request) request.lastDatabaseQuery = event.query;
      });
    }
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database connected successfully.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
