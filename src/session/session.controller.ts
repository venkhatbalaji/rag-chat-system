import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { SessionResponseDto } from './dto/session-response.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { Session } from './schemas/session.schema';
import {
  ApiResponse as Response,
  createSuccessResponse,
} from '../common/utils/response.util';
import { DeleteResult } from 'mongoose';

@ApiTags('Session')
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'List sessions with filters and pagination' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, type: [SessionResponseDto] })
  async getSessions(@Query() query: QuerySessionsDto) {
    const sessions = await this.sessionService.getSessions(query);
    return createSuccessResponse(sessions);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({ status: 201, type: SessionResponseDto })
  async create(@Body() body: CreateSessionDto, @Res() res: ExpressResponse) {
    await this.sessionService.createSession(body.userId, body.title, res);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a session and its messages' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  async delete(
    @Param('id') sessionId: string,
  ): Promise<Response<DeleteResult>> {
    const result = await this.sessionService.deleteSession(sessionId);
    return createSuccessResponse(result);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update session title or favorite status' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateSessionDto })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSessionDto,
  ): Promise<Response<Session>> {
    const session = await this.sessionService.updateSession(id, body);
    return createSuccessResponse(session);
  }
}
