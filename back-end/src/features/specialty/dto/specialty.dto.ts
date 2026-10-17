import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSpecialtyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;
}

export class UpdateSpecialtyDto extends CreateSpecialtyDto {}
