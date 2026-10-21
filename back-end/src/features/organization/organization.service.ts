import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../../generated/prisma/client';
import { IUserRequest } from '../../core/interfaces/user-request.interface';
import { PrismaService } from '../../core/service/prisma.service';
import { CompleteStartupDto } from './dto/complete-startup.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { LocalFileService } from '../../core/service/local-file.service';
import { unlinkSync, existsSync } from 'node:fs';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly localFileService: LocalFileService,
  ) {}

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

      const permissions = await tx.permission.findMany({
        select: { id: true },
      });

      const role = await tx.role.create({
        data: {
          organizationId: organization.id,
          name: 'Admin',
          isSystemRole: true,
        },
      });

      if (permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map(({ id }) => ({
            roleId: role.id,
            permissionId: id,
            organizationId: organization.id,
          })),
        });
      }

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

  async getStartupOptions() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        name_en: true,
        name_ar: true,
        description_en: true,
        description_ar: true,
        page: {
          select: {
            key: true,
            name_en: true,
            name_ar: true,
            description_en: true,
            description_ar: true,
          },
        },
      },
    });

    return {
      permissions: permissions.map((permission) => ({
        ...permission,
        id: permission.id.toString(),
      })),
    };
  }

  async completeStartup(user: IUserRequest, dto: CompleteStartupDto) {
    try {
      if (dto.organizationLogo) {
        dto.organizationLogoUrl = await this.localFileService.save(
          this.localFileService.prepareDirectory([
            this.localFileService.ORGANIZATION_FOLDER,
            this.localFileService.PROFILE_IMAGES_FOLDER,
            `org_logo_${user.organizationId}`,
          ]),
          dto.organizationLogo.buffer,
        );
      }
      if (dto.profileImage) {
        dto.profileImageUrl = await this.localFileService.save(
          this.localFileService.prepareDirectory([
            this.localFileService.ORGANIZATION_FOLDER,
            this.localFileService.PROFILE_IMAGES_FOLDER,
            this.localFileService.PROFILE_IMAGES_PREFIX + user.id,
          ]),
          dto.profileImage.buffer,
        );
      }
      for (const certification of dto.certifications ?? []) {
        if (certification.certificateFile) {
          certification.certificateUrl = await this.localFileService.save(
            this.localFileService.prepareDirectory([
              this.localFileService.ORGANIZATION_FOLDER,
              this.localFileService.CERTIFICATIONS_FOLDER,
              this.localFileService.CERTIFICATIONS_PREFIX + user.id,
            ]),
            certification.certificateFile.buffer,
          );
        }
      }
      return this.prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findFirst({
          where: { id: user.id, organizationId: user.organizationId },
          select: { id: true },
        });
        if (!existingUser) throw new NotFoundException('User not found');

        await tx.organization.update({
          where: { id: user.organizationId },
          data: {
            logoUrl: dto.organizationLogoUrl,
            briefDescription: dto.briefDescription,
          },
        });

        await tx.user.update({
          where: { id: user.id, organizationId: user.organizationId },
          data: {
            profileImageUrl: dto.profileImageUrl,
            jobTitle: dto.jobTitle,
            previousWorkingExperiences: dto.previousWorkingExperiences as
              Prisma.InputJsonValue | undefined,
            currentWorkingExperiences: dto.currentWorkingExperiences as
              Prisma.InputJsonValue | undefined,
            certifications: dto.certifications as
              Prisma.InputJsonValue | undefined,
          },
        });

        const permissionIds = [
          ...new Set(
            (dto.roles ?? []).flatMap((role) =>
              (role.permissionIds ?? []).map((permissionId) =>
                BigInt(permissionId),
              ),
            ),
          ),
        ];
        const permissions = permissionIds.length
          ? await tx.permission.findMany({
              where: { id: { in: permissionIds } },
              select: { id: true },
            })
          : [];
        if (permissions.length !== permissionIds.length) {
          throw new BadRequestException('One or more permissions do not exist');
        }

        for (const role_dto of dto.roles ?? []) {
          const role = await tx.role.create({
            data: {
              organizationId: user.organizationId,
              name: role_dto.name,
              isSystemRole: false,
            },
          });
          const rolePermissionIds = (role_dto.permissionIds ?? []).map((id) =>
            BigInt(id),
          );
          if (rolePermissionIds.length) {
            await tx.rolePermission.createMany({
              data: rolePermissionIds.map((permissionId) => ({
                roleId: role.id,
                permissionId,
                organizationId: user.organizationId,
              })),
            });
          }
        }

        const specialtiesByName = new Map<string, bigint>();
        for (const rawName of dto.specialties ?? []) {
          const name = rawName.trim();
          if (!name) continue;
          const existing = await tx.specialty.findUnique({
            where: { name },
            select: { id: true, organizationId: true },
          });
          if (existing && existing.organizationId !== user.organizationId) {
            throw new ConflictException('Specialty name already exists');
          }
          const specialty =
            existing ??
            (await tx.specialty.create({
              data: { name, organizationId: user.organizationId },
              select: { id: true },
            }));
          specialtiesByName.set(name, specialty.id);
        }

        const userSpecialtyIds = [...specialtiesByName.values()];
        if (userSpecialtyIds.length) {
          await tx.doctorSpecialty.createMany({
            data: userSpecialtyIds.map((specialtyId) => ({
              userId: user.id,
              specialtyId,
            })),
            skipDuplicates: true,
          });
        }

        const clinics: { id: string; name: string }[] = [];
        for (const clinic_dto of dto.clinics) {
          const clinic = await tx.clinic.create({
            data: {
              organizationId: user.organizationId,
              name: clinic_dto.name,
              phone: clinic_dto.phone,
              address: clinic_dto.address,
            },
            select: { id: true, name: true },
          });
          await tx.clinicUser.create({
            data: { clinicId: clinic.id, userId: user.id },
          });
          const clinicSpecialtyIds = (clinic_dto.specialties ?? [])
            .map((name) => specialtiesByName.get(name.trim()))
            .filter((id): id is bigint => id !== undefined);
          if (clinicSpecialtyIds.length) {
            await tx.clinicSpecialty.createMany({
              data: clinicSpecialtyIds.map((specialtyId) => ({
                clinicId: clinic.id,
                specialtyId,
              })),
              skipDuplicates: true,
            });
          }
          clinics.push({ id: clinic.id.toString(), name: clinic.name });
        }

        return { completed: true, clinics };
      });
    } catch (error) {
      if (dto.profileImageUrl && existsSync(dto.profileImageUrl)) {
        unlinkSync(dto.profileImageUrl);
      }
      for (const certification of dto.certifications ?? []) {
        if (
          certification.certificateUrl &&
          existsSync(certification.certificateUrl)
        ) {
          unlinkSync(certification.certificateUrl);
        }
      }
      throw error;
    }
  }
}
