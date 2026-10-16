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
  UseInterceptors,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import { AuthGuard } from '../core/guards/auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { ToCrudUserInterceptor } from './interceptor/to-crud-user.interceptor';
import { ToPublicUserInterceptor } from './interceptor/to-public-user.interceptor';
import { UserService } from './user.service';

type SessionUser = { id: bigint; organizationId: bigint };

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(ToCrudUserInterceptor)
  findAll(@CurrentUser() user: SessionUser) {
    return this.userService.findAll(user.organizationId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ToCrudUserInterceptor)
  findOne(
    @CurrentUser() user: SessionUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.findOne(user.organizationId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(ToCrudUserInterceptor)
  create(@CurrentUser() user: SessionUser, @Body() dto: CreateUserDto) {
    return this.userService.create(user.organizationId, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ToCrudUserInterceptor)
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
  @UseInterceptors(ToPublicUserInterceptor)
  async login(@Body() dto: LoginDto, @Req() request: FastifyRequest) {
    const result = await this.userService.login(dto);

    await request.session.regenerate();
    request.session.userId = result.userId;
    request.session.options({ maxAge: result.sessionTtl });

    return {
      user: result.user,
      startup: result.startup,
      refresh_token: result.refreshToken,
      refresh_token_expires_at: result.refreshTokenExpiresAt.toISOString(),
    };
  }

  @Post('rbac')
  @UseGuards(AuthGuard)
  @UseInterceptors(ToPublicUserInterceptor)
  async rbac(@CurrentUser() user: SessionUser) {
    const { user: confirmedUser, startup } =
      await this.userService.confirmSession(user.id);
    return { user: confirmedUser, startup };
  }

  @Post('refresh')
  @UseGuards(AuthGuard)
  @UseInterceptors(ToPublicUserInterceptor)
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
