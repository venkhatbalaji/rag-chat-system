import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { ChatService } from './chat.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { Message } from './schemas/message.schema';
import {
  ApiResponse as Response,
  createSuccessResponse,
} from '../common/utils/response.util';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

@ApiTags('Chat')
@ApiSecurity('API_KEY')
@Controller('sessions/:sessionId/message')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all messages with pagination and optional search',
  })
  @ApiParam({ name: 'sessionId' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'search', required: false })
  @UseGuards(RateLimitGuard)
  @ApiResponse({ status: 200, type: [MessageResponseDto] })
  async getMessages(
    @Param('sessionId') sessionId: string,
    @Query() query: QueryMessagesDto,
  ): Promise<Response<Message[]>> {
    const message = await this.chatService.getMessagesBySession(
      sessionId,
      query,
    );
    return createSuccessResponse(message);
  }
}
