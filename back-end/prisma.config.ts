import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.dev' }); // relative to CWD

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
