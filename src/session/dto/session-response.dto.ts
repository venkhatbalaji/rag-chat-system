import { ApiProperty } from '@nestjs/swagger';
import { MessageResponseDto } from '../../chat/dto/message-response.dto';

export class SessionResponseDto {
  @ApiProperty({ example: '0b2e3541-74c1-4e1c-a320-b8e6c2d0205d' })
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ type: [MessageResponseDto] })
  messages: MessageResponseDto[];

  @ApiProperty({ example: false })
  isFavorite: boolean;

  @ApiProperty({ example: '2025-05-10T08:50:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-05-10T08:50:00.000Z' })
  updatedAt: string;
}
