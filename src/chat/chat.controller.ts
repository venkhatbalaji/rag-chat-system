import { Controller, Post, Get, Param, Body, Query, Res } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { ChatService } from './chat.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AddMessageDto } from './dto/add-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { Message } from './schemas/message.schema';
import {
  ApiResponse as Response,
  createSuccessResponse,
} from '../common/utils/response.util';

@ApiTags('Chat')
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

  @Post()
  @ApiOperation({ summary: 'Add a message to a session with optional context' })
  @ApiParam({ name: 'sessionId' })
  @ApiBody({ type: AddMessageDto })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  async addMessage(
    @Param('sessionId') sessionId: string,
    @Body() body: AddMessageDto,
    @Res() res: ExpressResponse,
  ) {
    await this.chatService.processMessage(
      sessionId,
      body.sender,
      body.content,
      res,
    );
  }
}
