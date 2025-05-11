import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSessionDto {
  @ApiPropertyOptional({ description: 'Update the session title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Mark session as favorite or not' })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
