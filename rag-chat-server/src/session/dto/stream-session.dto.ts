import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum ModelTypeMapper {
  DEEP_SEEK = 'deep-seek',
  OPEN_CHAT = 'open-chat',
}

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

  @ApiProperty({
    description: 'Model type used for generation',
    enum: ModelTypeMapper,
    example: ModelTypeMapper.DEEP_SEEK,
  })
  @IsEnum(ModelTypeMapper)
  modelType: ModelTypeMapper;
}
