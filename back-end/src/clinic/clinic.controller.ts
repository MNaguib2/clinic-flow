import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import { AuthGuard } from '../core/guards/auth.guard';
import { ClinicService } from './clinic.service';
import { CreateClinicDto, UpdateClinicDto } from './dto/clinic.dto';
import { ToPublicClinicInterceptor } from './interceptor/to-public-clinic.interceptor';

type SessionUser = {
  id: bigint;
  organizationId: bigint;
  fullName: string;
  phoneNumber: string | null;
};

@Controller('clinics')
@UseGuards(AuthGuard)
export class ClinicController {
  constructor(private readonly service: ClinicService) {}

  @Get()
  @UseInterceptors(ToPublicClinicInterceptor)
  findAll(@CurrentUser() user: SessionUser) {
    return this.service.findAll(user.organizationId);
  }

  @Get(':id')
  @UseInterceptors(ToPublicClinicInterceptor)
  findOne(
    @CurrentUser() user: SessionUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(user.organizationId, id);
  }

  @Post()
  @UseInterceptors(ToPublicClinicInterceptor)
  create(@CurrentUser() user: SessionUser, @Body() dto: CreateClinicDto) {
    return this.service.create(user.organizationId, dto);
  }

  @Patch(':id')
  @UseInterceptors(ToPublicClinicInterceptor)
  update(
    @CurrentUser() user: SessionUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClinicDto,
  ) {
    return this.service.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @CurrentUser() user: SessionUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(user.organizationId, id);
  }
}
