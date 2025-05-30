import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StreamSessionDto {
  @ApiProperty({
    description: 'title for the session',
  })
  @IsString()
  title: string;
  @ApiProperty({
    description: 'session ID to stream messages',
  })
  @IsString()
  sessionId: string;
}
