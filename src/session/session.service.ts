import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { DeleteResult, Model, Types } from 'mongoose';
import { Response } from 'express';
import {
  Message,
  MessageDocument,
  SenderType,
} from '../chat/schemas/message.schema';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly chatService: ChatService,
  ) {}

  async getSessions(query: QuerySessionsDto) {
    const { limit = 10, offset = 0, userId } = query;

    return this.sessionModel
      .find({ userId })
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('messages')
      .exec();
  }

  async createSession(userId: string, title: string, res: Response) {
    const session = await this.sessionModel.create({ userId, title });
    await this.chatService.processMessage(
      session._id.toString(),
      SenderType.USER,
      title,
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
