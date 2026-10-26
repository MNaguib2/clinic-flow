import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  Allow,
} from 'class-validator';
import * as formDataInterface from 'src/core/interfaces/form-data.interface';

export class StartupWorkExperienceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  workplace!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class StartupCertificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  issuer?: string;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  certificateUrl?: string;

  certificateFile?: formDataInterface.ValidatedMultipartFile;
}

export class StartupRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Matches(/^\d+$/, { each: true })
  permissionIds?: string[];
}

export class StartupClinicDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  address?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @Allow()
  clinicImage?: formDataInterface.ValidatedMultipartFile;
}

export class CompleteStartupDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  briefDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  organizationLogoUrl?: string;

  @Allow()
  organizationLogo?: formDataInterface.ValidatedMultipartFile;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  profileImageUrl?: string;

  @Allow()
  profileImage?: formDataInterface.ValidatedMultipartFile;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StartupWorkExperienceDto)
  previousWorkingExperiences?: StartupWorkExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StartupWorkExperienceDto)
  currentWorkingExperiences?: StartupWorkExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StartupCertificationDto)
  certifications?: StartupCertificationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StartupRoleDto)
  roles?: StartupRoleDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @Allow()
  specialtyImages?: Record<number, formDataInterface.ValidatedMultipartFile>;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StartupClinicDto)
  clinics!: StartupClinicDto[];
}
