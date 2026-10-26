import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../core/service/prisma.service';
import { sessionConfig } from '../../core/config/session.config';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from 'generated/prisma/client';
import { IUserRequest } from 'src/core/interfaces/user-request.interface';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    let startup = false;
    const users = await this.prisma.user.findMany({
      where: { phoneNumber: dto.phone, isActive: true },
      select: {
        id: true,
        organizationId: true,
        fullName: true,
        phoneNumber: true,
        passwordHash: true,
        jobTitle: true,
        specialties: true,
        // كدا كدا اليوزر اللى هيلوج بيه ليه رول واحده بس حالياً
        roles: {
          where: {
            clinicId: null,
          },
          select: {
            role: true,
          },
        },
      },
    });

    type LoginUser = Omit<(typeof users)[number], 'roles'> & {
      roles: object;
    };
    let matchingUser: LoginUser | undefined;
    let matchingUserCount = 0;
    for (const user of users) {
      if (await bcrypt.compare(dto.password, user.passwordHash)) {
        matchingUser = {
          ...user,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          roles: user.roles && user.roles.length > 0 ? user.roles[0].role : {},
        };
        matchingUserCount++;
      }
    }

    if (matchingUserCount !== 1 || !matchingUser) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    const clinics = await this.prisma.clinic.findMany({
      where: {
        organizationId: matchingUser.organizationId,
        users: { some: { userId: matchingUser.id } },
      },
      select: { id: true, name: true },
    });

    if (clinics.length === 0) {
      startup = await this.checkUserStartup(matchingUser);
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
      user,
      refreshToken,
      refreshTokenExpiresAt,
      sessionTtl,
      userId: user.id.toString(),
      startup,
    };
  }

  async confirmSession(user: IUserRequest) {
    let startup = false;
    const userFetch = await this.prisma.user.findFirst({
      where: {
        id: user.id,
        isActive: true,
        refreshTokens: {
          some: {
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
        },
      },
      select: {
        id: true,
        organizationId: true,
        fullName: true,
        phoneNumber: true,
        clinics: true,
        roles: {
          where: {
            userId: user.id,
            clinicId: null,
          },
          include: {
            role: true,
          },
        },
        isActive: true,
      },
    });

    if (!userFetch) {
      throw new UnauthorizedException('Session or refresh token is invalid');
    }

    if (userFetch.clinics.length === 0) {
      startup = await this.checkUserStartup(userFetch);
    }

    const { roles, ...rest } = userFetch;
    return { user: { ...rest, roles: roles[0]?.role ?? null }, startup };
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
      user: result,
      refreshToken: nextRefreshToken,
      refreshTokenExpiresAt,
      sessionTtl: refreshTtl,
      userId: result.id.toString(),
    };
  }

  private static readonly crudSelect = {
    id: true,
    fullName: true,
    email: true,
    phoneNumber: true,
    birthday: true,
    isActive: true,
  } as const;

  async findAll(organizationId: bigint) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: UserService.crudSelect,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(organizationId: bigint, id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: BigInt(id), organizationId },
      select: UserService.crudSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(organizationId: bigint, dto: CreateUserDto) {
    const email = dto.email.toLowerCase();
    await this.assertEmailFree(email);
    const user = await this.prisma.user.create({
      data: {
        organizationId,
        fullName: dto.fullName,
        email,
        phoneNumber: dto.phone,
        birthday: dto.birthday ? new Date(dto.birthday) : undefined,
        passwordHash: await bcrypt.hash(dto.password, 12),
      },
      select: UserService.crudSelect,
    });
    return user;
  }

  async update(organizationId: bigint, id: number, dto: UpdateUserDto) {
    await this.findOne(organizationId, id);
    const email = dto.email?.toLowerCase();
    if (email) await this.assertEmailFree(email, id);
    const user = await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: {
        fullName: dto.fullName,
        email,
        phoneNumber: dto.phone,
        birthday: dto.birthday ? new Date(dto.birthday) : undefined,
        isActive: dto.isActive,
      },
      select: UserService.crudSelect,
    });
    return user;
  }

  // Soft delete: users are referenced by appointments, invoices, etc.
  async remove(organizationId: bigint, id: number) {
    await this.findOne(organizationId, id);
    await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
    await this.prisma.refreshToken.updateMany({
      where: { userId: BigInt(id), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async assertEmailFree(email: string, exceptId?: number) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== BigInt(exceptId ?? -1)) {
      throw new ConflictException('Email is already registered');
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async checkUserStartup(
    matchingUser: Pick<User, 'id' | 'organizationId'>,
  ): Promise<boolean> {
    let startup = false;
    // first check if have another role in the organization and check if exist clinics for that role
    // if not, send attribute startup to front end to show the startup page
    const otherRoles = await this.prisma.user.findMany({
      where: {
        organizationId: matchingUser.organizationId,
        id: { not: matchingUser.id },
        isActive: true,
      },
      select: { id: true },
    });

    if (otherRoles.length === 0) {
      const otherRolesClinics = await this.prisma.clinic.findMany({
        where: {
          organizationId: matchingUser.organizationId,
          users: { some: { userId: { in: otherRoles.map((r) => r.id) } } },
        },
        select: { id: true, name: true },
      });

      if (otherRolesClinics.length === 0) {
        startup = true;
      }
    }
    return startup;
  }
}
