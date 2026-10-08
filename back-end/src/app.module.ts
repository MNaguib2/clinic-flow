import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { OrganizationModule } from './organization/organization.module';
import { UserModule } from './user/user.module';
import { ClinicModule } from './clinic/clinic.module';
import { SpecialtyModule } from './specialty/specialty.module';

@Module({
  imports: [
    DatabaseModule,
    OrganizationModule,
    UserModule,
    ClinicModule,
    SpecialtyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
