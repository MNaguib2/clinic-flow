import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ClinicRecord {
  id: bigint;
  name: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  specialties: { specialty: { id: bigint; name: string } }[];
}

interface PublicClinic {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  specialties: { id: string; name: string }[];
}

@Injectable()
export class ToPublicClinicInterceptor implements NestInterceptor<
  ClinicRecord | ClinicRecord[],
  PublicClinic | PublicClinic[]
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<ClinicRecord | ClinicRecord[]>,
  ): Observable<PublicClinic | PublicClinic[]> {
    return next
      .handle()
      .pipe(
        map((data) =>
          Array.isArray(data)
            ? data.map((clinic) => this.toPublicClinic(clinic))
            : this.toPublicClinic(data),
        ),
      );
  }

  private toPublicClinic(clinic: ClinicRecord): PublicClinic {
    return {
      id: clinic.id.toString(),
      name: clinic.name,
      phone: clinic.phone,
      address: clinic.address,
      isActive: clinic.isActive,
      specialties: clinic.specialties.map(({ specialty }) => ({
        id: specialty.id.toString(),
        name: specialty.name,
      })),
    };
  }
}
