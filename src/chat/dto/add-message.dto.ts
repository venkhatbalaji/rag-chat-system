import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SenderType } from '../schemas/message.schema';

export class AddMessageDto {
  @ApiProperty({ enum: SenderType, description: 'Sender of the message' })
  @IsEnum(SenderType)
  sender: SenderType;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
