import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^\+?[0-9]{7,20}$/, { message: 'phone is invalid' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password!: string;

  @IsBoolean()
  remember_me!: boolean;
}
