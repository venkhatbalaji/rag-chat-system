import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Optional title for the session',
    required: false,
  })
  @IsString()
  title: string;
}
