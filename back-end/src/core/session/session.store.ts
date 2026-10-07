/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaService } from '../service/prisma.service';
import type { SessionStore } from '@fastify/session';

type SessionData = Parameters<SessionStore['set']>[1];
type SetCallback = Parameters<SessionStore['set']>[2];
type GetCallback = Parameters<SessionStore['get']>[1];
type DestroyCallback = Parameters<SessionStore['destroy']>[1];

export class PrismaSessionStore {
  constructor(private readonly prisma: PrismaService) {}

  set(sessionId: string, session: SessionData, callback: SetCallback): void {
    void this.prisma.session
      .upsert({
        where: {
          sessionId,
        },
        create: {
          sessionId,
          data: session as object,
        },
        update: {
          data: session as object,
        },
      })
      .then(() => callback(undefined))
      .catch((error: unknown) => {
        callback(
          error instanceof Error ? error : new Error('Failed to save session'),
        );
      });
  }

  get(sessionId: string, callback: GetCallback): void {
    void this.prisma.session
      .findUnique({
        where: {
          sessionId,
        },
      })
      .then((record) => {
        if (!record) {
          callback(undefined, null);
          return;
        }

        if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
          return this.prisma.session
            .delete({
              where: {
                sessionId,
              },
            })
            .then(() => callback(undefined, null));
        }

        callback(undefined, record.data as unknown as SessionData);
      })
      .catch((error: unknown) => {
        callback(
          error instanceof Error ? error : new Error('Failed to load session'),
        );
      });
  }

  destroy(sessionId: string, callback: DestroyCallback): void {
    void this.prisma.session
      .deleteMany({
        where: {
          sessionId,
        },
      })
      .then(() => callback(undefined))
      .catch((error: unknown) => {
        callback(
          error instanceof Error
            ? error
            : new Error('Failed to destroy session'),
        );
      });
  }
}
