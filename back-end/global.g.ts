import 'fastify';
import { IUserRequest } from 'src/core/interfaces/user-request.interface';

declare global {
  // @types/node exposes ProcessEnv inside this namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'prod' | 'dev';
      PORT?: string;
      DATABASE_URL?: string;
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: IUserRequest;
  }
}

export {};
