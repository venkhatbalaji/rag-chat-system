import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: 'User ID that owns the session' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Optional title for the session',
    required: false,
  })
  @IsString()
  title: string;
}
