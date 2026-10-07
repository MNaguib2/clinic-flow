import { IsString, Matches } from 'class-validator';

export class RefreshDto {
  @IsString()
  @Matches(/^[a-f\d]{64}$/i)
  refresh_token: string;
}
