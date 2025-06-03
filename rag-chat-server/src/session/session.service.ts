import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import mongoose, { DeleteResult, Model } from 'mongoose';
import { Response } from 'express';
import {
  Message,
  MessageDocument,
  ModelType,
  SenderType,
} from '../chat/schemas/message.schema';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { ChatService } from '../chat/chat.service';
import { ModelTypeMapper } from './dto/stream-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly chatService: ChatService,
  ) {}

  async getSessions(
    query: QuerySessionsDto,
    userId: string,
  ): Promise<Session[]> {
    const { limit = 10, offset = 0 } = query;

    return this.sessionModel
      .find({ userId })
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('messages')
      .exec();
  }

  async createSession(userId: string, title: string) {
    const session = await this.sessionModel.create({
      userId,
      title,
      triggered: false,
    });
    return session?._id;
  }

  async getSessionById(userId: string, sessionID: string) {
    const session = await this.sessionModel.findById({
      _id: new mongoose.Types.ObjectId(sessionID),
      userId: userId,
    });
    return session;
  }

  async stream(
    sessionId: string,
    message: string,
    mapper: ModelTypeMapper,
    res: Response,
  ) {
    await this.chatService.processMessage(
      sessionId,
      SenderType.USER,
      mapper === ModelTypeMapper.DEEP_SEEK
        ? ModelType.DEEPSEEK
        : ModelType.OPENCHAT,
      message,
      res,
    );
  }

  async deleteSession(id: string): Promise<DeleteResult> {
    const session = await this.sessionModel.findById(id);
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    await this.messageModel.deleteMany({ sessionId: id });
    return this.sessionModel.deleteOne({ _id: id });
  }

  async updateSession(id: string, updates: Partial<Session>) {
    const session = await this.sessionModel.findById(id);
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    await this.sessionModel.updateOne({ _id: id }, updates);
    return this.sessionModel.findById(id);
  }
}
