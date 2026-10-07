import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../core/service/prisma.service';
import { RegisterOrganizationDto } from './dto/register-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterOrganizationDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: dto.organizationTitle },
      });

      const role = await tx.role.create({
        data: {
          organizationId: organization.id,
          name: 'Admin',
          isSystemRole: true,
        },
      });

      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          fullName: dto.userName,
          email,
          phoneNumber: dto.phone,
          birthday: new Date(dto.birthday),
          passwordHash,
          roles: { create: { roleId: role.id } },
        },
      });

      return {
        organization: {
          id: organization.id.toString(),
          name: organization.name,
        },
        user: {
          id: user.id.toString(),
          fullName: user.fullName,
          email: user.email,
        },
      };
    });
  }
}
