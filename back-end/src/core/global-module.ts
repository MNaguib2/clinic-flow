import { Global, Module } from '@nestjs/common';
import { LocalFileService } from './service/local-file.service';
import { PrismaService } from './service/prisma.service';
import { FormDataService } from './service/form-data.service';

@Global() // Makes it global
@Module({
  providers: [LocalFileService, PrismaService, FormDataService],
  exports: [LocalFileService, PrismaService, FormDataService],
})
export class GlobalSharedModule {}
