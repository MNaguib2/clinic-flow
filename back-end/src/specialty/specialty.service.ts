import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../core/service/prisma.service';
import { CreateSpecialtyDto, UpdateSpecialtyDto } from './dto/specialty.dto';
import { IUserRequest } from 'src/core/interfaces/user-request.interface';

const toPublic = (s: { id: bigint; name: string }) => ({
  id: s.id.toString(),
  name: s.name,
});

@Injectable()
export class SpecialtyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ user }: { user: IUserRequest }) {
    const rows = await this.prisma.specialty.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: 'asc' },
    });
    return rows.map(toPublic);
  }

  async findOne({ id, user }: { id: number; user: IUserRequest }) {
    const row = await this.prisma.specialty.findFirst({
      where: { id: BigInt(id), organizationId: user.organizationId },
    });
    if (!row) throw new NotFoundException('Specialty not found');
    return toPublic(row);
  }

  async create({ dto, user }: { dto: CreateSpecialtyDto; user: IUserRequest }) {
    await this.assertNameFree({
      name: dto.name,
      organizationId: user.organizationId,
    });
    return toPublic(
      await this.prisma.specialty.create({
        data: { ...dto, organizationId: user.organizationId },
      }),
    );
  }

  async update({
    id,
    dto,
    user,
  }: {
    id: number;
    dto: UpdateSpecialtyDto;
    user: IUserRequest;
  }) {
    await this.findOne({ id, user });
    await this.assertNameFree({
      name: dto.name,
      exceptId: id,
      organizationId: user.organizationId,
    });
    return toPublic(
      await this.prisma.specialty.update({
        where: { id: BigInt(id), organizationId: user.organizationId },
        data: { name: dto.name },
      }),
    );
  }

  async remove({ id, user }: { id: number; user: IUserRequest }) {
    await this.findOne({ id, user });
    try {
      await this.prisma.specialty.delete({
        where: { id: BigInt(id), organizationId: user.organizationId },
      });
    } catch {
      throw new ConflictException('Specialty is in use');
    }
  }

  private async assertNameFree({
    name,
    exceptId,
    organizationId,
  }: {
    name: string;
    exceptId?: number;
    organizationId: bigint;
  }) {
    const existing = await this.prisma.specialty.findUnique({
      where: { name, organizationId: organizationId },
    });
    if (existing && existing.id !== BigInt(exceptId ?? -1)) {
      throw new ConflictException('Specialty name already exists');
    }
  }
}
