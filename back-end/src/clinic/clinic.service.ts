import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/service/prisma.service';
import { CreateClinicDto, UpdateClinicDto } from './dto/clinic.dto';

const include = { specialties: { include: { specialty: true } } };

type ClinicRow = {
  id: bigint;
  name: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  specialties: { specialty: { id: bigint; name: string } }[];
};

const toPublic = (c: ClinicRow) => ({
  id: c.id.toString(),
  name: c.name,
  phone: c.phone,
  address: c.address,
  isActive: c.isActive,
  specialties: c.specialties.map((s) => ({
    id: s.specialty.id.toString(),
    name: s.specialty.name,
  })),
});

@Injectable()
export class ClinicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: bigint) {
    const rows = await this.prisma.clinic.findMany({
      where: { organizationId },
      include,
      orderBy: { id: 'asc' },
    });
    return rows.map(toPublic);
  }

  async findOne(organizationId: bigint, id: number) {
    const row = await this.prisma.clinic.findFirst({
      where: { id: BigInt(id), organizationId },
      include,
    });
    if (!row) throw new NotFoundException('Clinic not found');
    return toPublic(row);
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
    return toPublic(row);
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
    return toPublic(row);
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
