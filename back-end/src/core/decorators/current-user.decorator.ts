import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { IUserRequest } from '../interfaces/user-request.interface';

// here i set ! safely because I am sure that the user will always be attached to the request
// i use AuthGuard to guarantee that the user is always attached to the request
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUserRequest =>
    ctx.switchToHttp().getRequest<FastifyRequest>().user as IUserRequest,
);
