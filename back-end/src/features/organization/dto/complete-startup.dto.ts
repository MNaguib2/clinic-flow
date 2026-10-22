import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ValidatedMultipartFile } from 'src/core/interfaces/form-data.interface';

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

  certificateFile?: ValidatedMultipartFile;
}

export class StartupRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

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

  clinicImage?: ValidatedMultipartFile;
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

  organizationLogo?: ValidatedMultipartFile;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  profileImageUrl?: string;

  profileImage?: ValidatedMultipartFile;

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

  specialtyImages?: Record<number, ValidatedMultipartFile>;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StartupClinicDto)
  clinics!: StartupClinicDto[];
}
