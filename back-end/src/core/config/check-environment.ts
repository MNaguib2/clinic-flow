export function checkEnvironment() {
  const nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv) {
    throw new Error('NODE_ENV is not set.');
  }
  if (nodeEnv !== 'prod' && nodeEnv !== 'dev') {
    throw new Error('NODE_ENV must be either "prod" or "dev".');
  }
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET is not set.');
  }
  if (sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters long.');
  }
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }

  const PORT = process.env.PORT;
  if (!PORT) {
    throw new Error('PORT is not set.');
  }
}
