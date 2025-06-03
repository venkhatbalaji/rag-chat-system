import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Message,
  MessageDocument,
  ModelType,
  SenderType,
  Source,
} from './schemas/message.schema';
import { Session, SessionDocument } from '../session/schemas/session.schema';
import { Model, Types } from 'mongoose';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { Response } from 'express';
import { DeepseekService } from '../common/generator/generator.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    private readonly deepSeekService: DeepseekService,
  ) {}

  async processMessage(
    sessionId: string,
    sender: SenderType,
    modelType: ModelType = ModelType.DEEPSEEK,
    content: string,
    response: Response,
  ) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session)
      throw new NotFoundException(`Session with ID ${sessionId} not found`);

    if (!session?.triggered)
      await this.sessionModel.updateOne(
        { _id: sessionId },
        { $set: { triggered: true } },
      );

    const history = await this.getMessagesBySession(sessionId, {
      limit: 20,
      offset: 0,
      search: content,
    });

    const formattedHistory = history
      .map((msg) => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n');

    // Save user message
    await this.addMessage(sessionId, sender, content);

    const fullPrompt =
      `Format your response clearly using code blocks and helpful comments.Conversation so far:${formattedHistory}, User: ${content}AI:`.trim();
    try {
      // Await the streamed response to complete and capture the full answer
      this.deepSeekService.generate(
        fullPrompt,
        response,
        sessionId,
        modelType,
        async (finalAnswer, chunks) => {
          if (chunks?.length) {
            await this.saveAIMessage(sessionId, finalAnswer, [
              {
                similarityScore: 1,
                source: 'deepseek-coder',
                snippet: 'From deepseek-coder model',
              },
            ]);
          }
        },
      );
    } catch (err) {
      response.write(
        `data: ${JSON.stringify({ error: 'Generation failed' })}\n\n`,
      );
      response.end();
    }
  }

  async addMessage(sessionId: string, sender: SenderType, content: string) {
    const message = await this.messageModel.create({
      sessionId: new Types.ObjectId(sessionId),
      sender,
      content,
    });

    return message;
  }

  async saveAIMessage(sessionId: string, aiReply: string, sources: Source[]) {
    return this.messageModel.create({
      sessionId,
      sender: SenderType.AGENT,
      content: aiReply,
      sources: sources,
    });
  }

  async getMessagesBySession(sessionId: string, query: QueryMessagesDto) {
    const { limit = 10000, offset = 0, search } = query;

    const filters: any = { sessionId: new Types.ObjectId(sessionId) };

    if (search) {
      filters.$or = [
        { content: new RegExp(search, 'i') },
        { 'sources.snippet': new RegExp(search, 'i') },
        { 'sources.source': new RegExp(search, 'i') },
      ];
    }

    const messages = await this.messageModel
      .find(filters)
      .sort({ createdAt: 1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return messages.map((msg) => msg.toObject());
  }
}
