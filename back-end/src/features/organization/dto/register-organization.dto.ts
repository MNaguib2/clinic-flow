import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  organizationTitle: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  userName: string;

  @IsString()
  @Matches(/^\+?[0-9]{7,20}$/, { message: 'phone is invalid' })
  phone: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsDateString()
  birthday: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsString()
  confirmPassword: string;
}
