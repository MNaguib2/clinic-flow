import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface UserRecord {
  id: bigint;
  organizationId: bigint;
  fullName: string;
  phoneNumber: string | null;
  roles: Role;
}

interface UserResponse {
  user: UserRecord;
  [key: string]: unknown;
}

@Injectable()
export class ToPublicUserInterceptor implements NestInterceptor<
  UserResponse,
  Record<string, unknown>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<UserResponse>,
  ): Observable<Record<string, unknown>> {
    return next.handle().pipe(
      map(({ user, ...response }) => {
        return {
          ...response,
          user: {
            id: user.id.toString(),
            organizationId: user.organizationId.toString(),
            fullName: user.fullName,
            phone: user.phoneNumber,
            roles: user?.roles?.name,
          },
        };
      }),
    );
  }
}
