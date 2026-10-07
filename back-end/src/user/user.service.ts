import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../core/service/prisma.service';
import { sessionConfig } from '../core/config/session.config';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const users = await this.prisma.user.findMany({
      where: { phoneNumber: dto.phone, isActive: true },
      select: {
        id: true,
        organizationId: true,
        fullName: true,
        phoneNumber: true,
        passwordHash: true,
      },
    });

    let matchingUser: (typeof users)[number] | undefined;
    let matchingUserCount = 0;
    for (const user of users) {
      if (await bcrypt.compare(dto.password, user.passwordHash)) {
        matchingUser = user;
        matchingUserCount++;
      }
    }

    if (matchingUserCount !== 1 || !matchingUser) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const user = matchingUser;
    const sessionTtl = dto.remember_me
      ? sessionConfig.rememberMeTtl
      : sessionConfig.ttl;
    const refreshTokenExpiresAt = new Date(Date.now() + sessionTtl);
    const refreshToken = randomBytes(32).toString('hex');

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      user: this.toPublicUser(user),
      refreshToken,
      refreshTokenExpiresAt,
      sessionTtl,
      userId: user.id.toString(),
    };
  }

  async refresh(dto: RefreshDto) {
    const tokenHash = this.hashToken(dto.refresh_token);
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            organizationId: true,
            fullName: true,
            phoneNumber: true,
            isActive: true,
          },
        },
      },
    });
    const now = new Date();

    if (
      !token ||
      token.revokedAt ||
      token.expiresAt <= now ||
      !token.user.isActive
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const refreshTtl = token.expiresAt.getTime() - token.createdAt.getTime();
    const refreshTokenExpiresAt = new Date(now.getTime() + refreshTtl);
    const nextRefreshToken = randomBytes(32).toString('hex');
    const nextTokenHash = this.hashToken(nextRefreshToken);
    const result = await this.prisma.$transaction(async (tx) => {
      const revoked = await tx.refreshToken.updateMany({
        where: {
          id: token.id,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { revokedAt: now },
      });

      if (revoked.count !== 1) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      await tx.refreshToken.create({
        data: {
          userId: token.userId,
          tokenHash: nextTokenHash,
          expiresAt: refreshTokenExpiresAt,
        },
      });

      return token.user;
    });

    return {
      user: this.toPublicUser(result),
      refreshToken: nextRefreshToken,
      refreshTokenExpiresAt,
      sessionTtl: refreshTtl,
      userId: result.id.toString(),
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toPublicUser(user: {
    id: bigint;
    organizationId: bigint;
    fullName: string;
    phoneNumber: string | null;
  }) {
    return {
      id: user.id.toString(),
      organizationId: user.organizationId.toString(),
      fullName: user.fullName,
      phone: user.phoneNumber,
    };
  }
}
