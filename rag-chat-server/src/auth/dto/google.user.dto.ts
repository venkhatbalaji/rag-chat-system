import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleUserDto {
  @IsOptional()
  @IsString()
  sub?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsString()
  providerId: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsOptional()
  @IsString()
  provider?: string;
}
