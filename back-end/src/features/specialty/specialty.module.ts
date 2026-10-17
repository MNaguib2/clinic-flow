import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { SpecialtyController } from './specialty.controller';
import { SpecialtyService } from './specialty.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SpecialtyController],
  providers: [SpecialtyService],
})
export class SpecialtyModule {}
