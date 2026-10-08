import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ToPublicInterceptor implements NestInterceptor<{
  id: bigint;
  name: string;
}> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<{
      id: bigint;
      name: string;
    }>,
  ): Observable<{
    id: bigint;
    name: string;
  }> {
    return next.handle().pipe(
      map((data) => ({
        id: data.id,
        name: data.name,
      })),
    );
  }
}
