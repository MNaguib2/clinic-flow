import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PHONE = /^\+?[0-9]{7,20}$/;

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @Matches(PHONE, { message: 'phone is invalid' })
  phone!: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(PHONE, { message: 'phone is invalid' })
  phone?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
