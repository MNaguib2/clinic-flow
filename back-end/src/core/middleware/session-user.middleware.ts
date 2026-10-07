/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaService } from '../service/prisma.service';

export function sessionUserMiddleware(prisma: PrismaService) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = request.session?.userId;
    if (!userId || !/^\d+$/.test(userId)) return;

    const user = await prisma.user.findFirst({
      where: { id: BigInt(userId), isActive: true },
      select: {
        id: true,
        organizationId: true,
        fullName: true,
        phoneNumber: true,
      },
    });

    if (user) request.user = user;
  };
}
