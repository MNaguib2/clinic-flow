import { AsyncLocalStorage } from 'node:async_hooks';

export interface PrismaQueryRequest {
  lastDatabaseQuery?: string;
}

export const prismaQueryContext = new AsyncLocalStorage<PrismaQueryRequest>();
