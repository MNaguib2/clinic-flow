import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './core/service/prisma.service';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [OrganizationModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
