export const sessionConfig = {
  secret: process.env.SESSION_SECRET!,

  cookieName: process.env.SESSION_NAME ?? 'clinic.sid',

  ttl: Number(process.env.SESSION_TTL ?? 60 * 60 * 1000),

  rememberMeTtl: Number(
    process.env.SESSION_REMEMBER_TTL ?? 30 * 24 * 60 * 60 * 1000,
  ),

  cookie: {
    httpOnly: process.env.SESSION_HTTP_ONLY !== 'false',

    secure: process.env.SESSION_SECURE === 'true',

    sameSite:
      (process.env.SESSION_SAME_SITE as 'lax' | 'strict' | 'none') ?? 'lax',

    path: '/',
  },
};
