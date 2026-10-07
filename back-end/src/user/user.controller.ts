import { Body, Controller, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
