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
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response as ExpressResponse, Request } from 'express';
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
  ApiSecurity,
} from '@nestjs/swagger';
import { SessionResponseDto } from './dto/session-response.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { Session } from './schemas/session.schema';
import {
  ApiResponse as Response,
  createSuccessResponse,
} from '../common/utils/response.util';
import { DeleteResult } from 'mongoose';
import { StreamedMessageResponseDto } from '../chat/dto/streamed-message.dto';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { GoogleUserDto } from 'src/auth/dto/google.user.dto';
import { StreamSessionDto } from './dto/stream-session.dto';

@ApiTags('Session')
@Controller('sessions')
@ApiSecurity('API_KEY')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'List sessions with filters and pagination' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @UseGuards(RateLimitGuard)
  @ApiResponse({ status: 200, type: [SessionResponseDto] })
  async getSessions(@Req() req: Request, @Query() query: QuerySessionsDto) {
    const { sub: userId } = req.user as GoogleUserDto;
    const sessions = await this.sessionService.getSessions(query, userId);
    return createSuccessResponse(sessions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by id' })
  @UseGuards(RateLimitGuard)
  @ApiResponse({ status: 200, type: [SessionResponseDto] })
  async getSessionById(@Req() req: Request, @Param('id') sessionId: string) {
    const { sub: userId } = req.user as GoogleUserDto;
    const session = await this.sessionService.getSessionById(userId, sessionId);
    return createSuccessResponse(session);
  }

  @Post('stream')
  @ApiOperation({ summary: 'Create a new session' })
  @ApiBody({ type: StreamSessionDto })
  @UseGuards(RateLimitGuard)
  @ApiResponse({ status: 201, type: StreamSessionDto })
  async stream(@Body() body: StreamSessionDto, @Res() res: ExpressResponse) {
    await this.sessionService.stream(
      body?.sessionId,
      body.title,
      body.modelType,
      res,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiBody({ type: CreateSessionDto })
  @UseGuards(RateLimitGuard)
  @ApiResponse({ status: 201, type: StreamedMessageResponseDto })
  async create(@Req() req: Request, @Body() body: CreateSessionDto) {
    const { sub: userId } = req.user as GoogleUserDto;
    const id = await this.sessionService.createSession(userId, body.title);
    return createSuccessResponse(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a session and its messages' })
  @ApiParam({ name: 'id' })
  @UseGuards(RateLimitGuard)
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
  @UseGuards(RateLimitGuard)
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSessionDto,
  ): Promise<Response<Session>> {
    const session = await this.sessionService.updateSession(id, body);
    return createSuccessResponse(session);
  }
}
