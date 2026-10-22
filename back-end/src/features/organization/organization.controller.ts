import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { AuthGuard } from '../../core/guards/auth.guard';
import type { IUserRequest } from '../../core/interfaces/user-request.interface';
import { CompleteStartupDto } from './dto/complete-startup.dto';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { OrganizationService } from './organization.service';
import { FormDataService } from '../../core/service/form-data.service';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly form_data_service: FormDataService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterOrganizationDto) {
    return this.organizationService.register(dto);
  }

  @Get('startup/options')
  @UseGuards(AuthGuard)
  getStartupOptions() {
    return this.organizationService.getStartupOptions();
  }

  @Post('startup')
  @UseGuards(AuthGuard)
  async completeStartup(
    @CurrentUser() user: IUserRequest,
    @Req() request: FastifyRequest,
  ) {
    const { dto } =
      await this.form_data_service.parseAndValidate<CompleteStartupDto>(
        request,
        CompleteStartupDto,
        {
          files: [
            {
              field_name: 'organizationLogo',
              file_type: 'image',
              max_size: 5 * 1024 * 1024,
              assign_to: (startup_dto, file) => {
                startup_dto.organizationLogo = file;
              },
            },
            {
              field_name: 'profileImage',
              file_type: 'image',
              max_size: 5 * 1024 * 1024,
              assign_to: (startup_dto, file) => {
                startup_dto.profileImage = file;
              },
            },
            {
              field_name: /^clinicImage_\d+$/,
              file_type: 'image',
              max_size: 5 * 1024 * 1024,
              assign_to: (startup_dto, file, field_name) => {
                const match = /^clinicImage_(\d+)$/.exec(field_name);
                const index = match ? Number(match[1]) : -1;
                const clinic = startup_dto.clinics?.[index];
                if (!clinic) {
                  throw new BadRequestException(
                    'Clinic image has no matching clinic',
                  );
                }
                clinic.clinicImage = file;
              },
            },
            {
              field_name: /^certificationFile_\d+$/,
              file_type: 'any',
              max_size: 10 * 1024 * 1024,
              assign_to: (startup_dto, file, field_name) => {
                const match = /^certificationFile_(\d+)$/.exec(field_name);
                const index = match ? Number(match[1]) : -1;
                const certification = startup_dto.certifications?.[index];
                if (!certification) {
                  throw new BadRequestException(
                    'Certification file has no matching certification',
                  );
                }
                certification.certificateFile = file;
              },
            },
          ],
        },
      );

    return this.organizationService.completeStartup(user, dto);
  }
}
