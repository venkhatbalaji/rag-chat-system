import { ApiProperty } from '@nestjs/swagger';
import { SenderType } from '../schemas/message.schema';

export class MessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty({ enum: SenderType })
  sender: SenderType;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: string;
}