import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaQueryRequest, prismaQueryContext } from './prisma-query-context';

@Injectable()
export class PrismaQueryContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<PrismaQueryRequest>();

    return new Observable((subscriber) =>
      prismaQueryContext.run(request, () =>
        next.handle().subscribe(subscriber),
      ),
    );
  }
}
