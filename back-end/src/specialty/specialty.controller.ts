/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard';
import { CreateSpecialtyDto, UpdateSpecialtyDto } from './dto/specialty.dto';
import { SpecialtyService } from './specialty.service';
import { ToPublicInterceptor } from './interceptor/to-public-interceptor';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';

@Controller('specialties')
@UseGuards(AuthGuard)
export class SpecialtyController {
  constructor(private readonly service: SpecialtyService) {}

  @Get()
  @UseInterceptors(ToPublicInterceptor)
  findAll(@CurrentUser() user) {
    return this.service.findAll({ user });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.service.findOne({ id, user });
  }

  @Post()
  create(@Body() dto: CreateSpecialtyDto, @CurrentUser() user) {
    return this.service.create({ dto, user });
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSpecialtyDto,
    @CurrentUser() user,
  ) {
    return this.service.update({ id, dto, user });
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.service.remove({ id, user });
  }
}
