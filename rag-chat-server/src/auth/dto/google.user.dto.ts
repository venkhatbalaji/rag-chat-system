import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleUserDto {
  @IsString()
  sub?: string;

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
