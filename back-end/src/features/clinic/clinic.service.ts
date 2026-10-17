import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/service/prisma.service';
import { CreateClinicDto, UpdateClinicDto } from './dto/clinic.dto';

const include = { specialties: { include: { specialty: true } } };

@Injectable()
export class ClinicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: bigint) {
    return this.prisma.clinic.findMany({
      where: { organizationId },
      include,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(organizationId: bigint, id: number) {
    const row = await this.prisma.clinic.findFirst({
      where: { id: BigInt(id), organizationId },
      include,
    });
    if (!row) throw new NotFoundException('Clinic not found');
    return row;
  }

  async create(organizationId: bigint, dto: CreateClinicDto) {
    const { specialtyIds, ...data } = dto;
    const row = await this.prisma.clinic.create({
      data: {
        ...data,
        organizationId,
        specialties: {
          create: (specialtyIds ?? []).map((s) => ({ specialtyId: BigInt(s) })),
        },
      },
      include,
    });
    return row;
  }

  async update(organizationId: bigint, id: number, dto: UpdateClinicDto) {
    await this.findOne(organizationId, id);
    const { specialtyIds, ...data } = dto;
    const row = await this.prisma.clinic.update({
      where: { id: BigInt(id) },
      data: {
        ...data,
        ...(specialtyIds && {
          specialties: {
            deleteMany: {},
            create: specialtyIds.map((s) => ({ specialtyId: BigInt(s) })),
          },
        }),
      },
      include,
    });
    return row;
  }

  // Soft delete: clinics are referenced by appointments, invoices, etc.
  async remove(organizationId: bigint, id: number) {
    await this.findOne(organizationId, id);
    await this.prisma.clinic.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
  }
}
