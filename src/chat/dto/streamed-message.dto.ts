import { ApiProperty } from '@nestjs/swagger';

export class DeltaDto {
  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  sources?: string;
}

export class StreamedMessageResponseDto {
  @ApiProperty({ type: DeltaDto })
  delta: DeltaDto;

  @ApiProperty()
  sessionId: string;
}
