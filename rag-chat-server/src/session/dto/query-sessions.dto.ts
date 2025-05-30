import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QuerySessionsDto {
  @ApiPropertyOptional({ default: 20, type: Number })
  @Type(() => Number)
  @IsOptional()
  limit = 10;

  @ApiPropertyOptional({ default: 0, type: Number })
  @Type(() => Number)
  @IsOptional()
  offset = 0;
}
