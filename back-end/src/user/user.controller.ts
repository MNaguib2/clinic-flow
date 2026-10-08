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
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import { AuthGuard } from '../core/guards/auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserService } from './user.service';

type SessionUser = { organizationId: bigint };

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@CurrentUser() user: SessionUser) {
    return this.userService.findAll(user.organizationId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @CurrentUser() user: SessionUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.findOne(user.organizationId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: SessionUser, @Body() dto: CreateUserDto) {
    return this.userService.create(user.organizationId, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @CurrentUser() user: SessionUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  remove(
    @CurrentUser() user: SessionUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.remove(user.organizationId, id);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() request: FastifyRequest) {
    const result = await this.userService.login(dto);

    await request.session.regenerate();
    request.session.userId = result.userId;
    request.session.options({ maxAge: result.sessionTtl });

    return {
      user: result.user,
      refresh_token: result.refreshToken,
      refresh_token_expires_at: result.refreshTokenExpiresAt.toISOString(),
    };
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Req() request: FastifyRequest) {
    const result = await this.userService.refresh(dto);

    await request.session.regenerate();
    request.session.userId = result.userId;
    request.session.options({ maxAge: result.sessionTtl });

    return {
      user: result.user,
      refresh_token: result.refreshToken,
      refresh_token_expires_at: result.refreshTokenExpiresAt.toISOString(),
    };
  }
}
