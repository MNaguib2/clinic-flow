import 'fastify';

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
    user?: {
      id: bigint;
      organizationId: bigint;
      fullName: string;
      phoneNumber: string | null;
    };
  }
}

export {};
