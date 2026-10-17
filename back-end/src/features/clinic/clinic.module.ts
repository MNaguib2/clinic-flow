import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { ClinicController } from './clinic.controller';
import { ClinicService } from './clinic.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ClinicController],
  providers: [ClinicService],
})
export class ClinicModule {}
