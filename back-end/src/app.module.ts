import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { OrganizationModule } from './features/organization/organization.module';
import { UserModule } from './features/user/user.module';
import { ClinicModule } from './features/clinic/clinic.module';
import { SpecialtyModule } from './features/specialty/specialty.module';

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
