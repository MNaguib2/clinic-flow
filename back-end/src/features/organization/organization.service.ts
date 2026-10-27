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
    const [permissions, global_specialties] = await Promise.all([
      this.prisma.permission.findMany({
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
      }),
      this.prisma.globalSpecialty.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          code: true,
          name_en: true,
          name_ar: true,
          description_en: true,
          description_ar: true,
          imageUrl: true,
        },
      }),
    ]);

    return {
      permissions: permissions.map((permission) => ({
        ...permission,
        id: permission.id.toString(),
      })),
      globalSpecialties: global_specialties.map((specialty) => ({
        ...specialty,
        id: specialty.id.toString(),
      })),
    };
  }

  async completeStartup(user: IUserRequest, dto: CompleteStartupDto) {
    const saved_files: string[] = [];
    const save_file = async (relative_path: string, data: Buffer) => {
      const saved_path = await this.localFileService.save(relative_path, data);
      saved_files.push(saved_path);
      return saved_path;
    };

    try {
      const existing_clinic = await this.prisma.organization.findFirst({
        where: { id: user.organizationId },
        select: { clinics: true, specialties: true, roles: true },
      });
      if (
        existing_clinic &&
        (existing_clinic?.clinics.length > 0 ||
          existing_clinic?.roles.length > 1 ||
          existing_clinic?.specialties.length > 0)
      ) {
        throw new ConflictException(
          'Organization startup has already been completed',
        );
      }
      if (dto.organizationLogo) {
        dto.organizationLogoUrl = await save_file(
          this.localFileService.prepareDirectory([
            this.localFileService.ORGANIZATION_FOLDER,
            this.localFileService.PROFILE_IMAGES_FOLDER,
            `org_logo_${user.organizationId}`,
          ]),
          dto.organizationLogo.buffer,
        );
      }
      if (dto.profileImage) {
        dto.profileImageUrl = await save_file(
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
          certification.certificateUrl = await save_file(
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

        if (dto.email) {
          const normalized_email = dto.email.trim().toLowerCase();
          const existing_email_user = await tx.user.findUnique({
            where: { email: normalized_email },
            select: { id: true },
          });
          if (existing_email_user && existing_email_user.id !== user.id) {
            throw new ConflictException('Email is already registered');
          }
        }

        await tx.user.update({
          where: { id: user.id, organizationId: user.organizationId },
          data: {
            email: dto.email?.trim().toLowerCase() || undefined,
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
              description: role_dto.description?.trim() || null,
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
        for (const [specialty_index, rawName] of (
          dto.specialties ?? []
        ).entries()) {
          const name = rawName.trim();
          if (!name) continue;
          const existing = await tx.specialty.findUnique({
            where: { name },
            select: { id: true, organizationId: true, imageUrl: true },
          });
          if (existing && existing.organizationId !== user.organizationId) {
            throw new ConflictException('Specialty name already exists');
          }
          const global_specialty = await tx.globalSpecialty.findFirst({
            where: {
              isActive: true,
              OR: [{ name_en: name }, { name_ar: name }],
            },
            select: { imageUrl: true },
          });
          const specialty_image = dto.specialtyImages?.[specialty_index];
          const uploaded_image_url = specialty_image
            ? await save_file(
                this.localFileService.prepareDirectory([
                  this.localFileService.ORGANIZATION_FOLDER,
                  this.localFileService.SPECIALTY_IMAGES_FOLDER,
                  `${this.localFileService.SPECIALTY_IMAGES_PREFIX}${user.organizationId}_${specialty_index}`,
                ]),
                specialty_image.buffer,
              )
            : undefined;
          const image_url =
            uploaded_image_url ??
            existing?.imageUrl ??
            global_specialty?.imageUrl;
          const specialty = existing
            ? image_url
              ? await tx.specialty.update({
                  where: { id: existing.id },
                  data: { imageUrl: image_url },
                  select: { id: true },
                })
              : existing
            : await tx.specialty.create({
                data: {
                  name,
                  organizationId: user.organizationId,
                  imageUrl: image_url,
                },
                select: { id: true },
              });
          specialtiesByName.set(name, specialty.id);
        }

        const clinics: { id: string; name: string }[] = [];
        for (const [clinic_index, clinic_dto] of dto.clinics.entries()) {
          const image_url = clinic_dto.clinicImage
            ? await save_file(
                this.localFileService.prepareDirectory([
                  this.localFileService.ORGANIZATION_FOLDER,
                  this.localFileService.CLINIC_IMAGES_FOLDER,
                  `${this.localFileService.CLINIC_IMAGES_PREFIX}${user.organizationId}_${clinic_index}`,
                ]),
                clinic_dto.clinicImage.buffer,
              )
            : undefined;
          const clinic = await tx.clinic.create({
            data: {
              organizationId: user.organizationId,
              name: clinic_dto.name,
              phone: clinic_dto.phone,
              address: clinic_dto.address,
              imageUrl: image_url,
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
      await Promise.allSettled(
        saved_files.map((relative_path) =>
          this.localFileService.remove(relative_path),
        ),
      );
      throw error;
    }
  }
}
