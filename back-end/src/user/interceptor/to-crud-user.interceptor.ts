import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface CrudUserRecord {
  id: bigint;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  birthday: Date | null;
  isActive: boolean;
}

interface PublicCrudUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  birthday: Date | null;
  isActive: boolean;
}

@Injectable()
export class ToCrudUserInterceptor
  implements NestInterceptor<CrudUserRecord | CrudUserRecord[], PublicCrudUser | PublicCrudUser[]>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<CrudUserRecord | CrudUserRecord[]>,
  ): Observable<PublicCrudUser | PublicCrudUser[]> {
    return next.handle().pipe(
      map((data) =>
        Array.isArray(data)
          ? data.map((user) => this.toPublicUser(user))
          : this.toPublicUser(data),
      ),
    );
  }

  private toPublicUser(user: CrudUserRecord): PublicCrudUser {
    return {
      id: user.id.toString(),
      fullName: user.fullName,
      email: user.email,
      phone: user.phoneNumber,
      birthday: user.birthday,
      isActive: user.isActive,
    };
  }
}
