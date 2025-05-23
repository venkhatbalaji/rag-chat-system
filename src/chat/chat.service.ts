import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Message,
  MessageDocument,
  SenderType,
  Source,
} from './schemas/message.schema';
import { Session, SessionDocument } from '../session/schemas/session.schema';
import { Model, Types } from 'mongoose';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { RetrieverService } from '../mock/service/retriever.service';
import { GeneratorService } from '../mock/service/generator.service';
import { Response } from 'express';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,

    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    private readonly retrieverService: RetrieverService,
    private readonly generatorService: GeneratorService,
  ) {}

  async processMessage(
    sessionId: string,
    sender: SenderType,
    content: string,
    response: Response,
  ) {
    let finalAnswer = '';
    //Validate session existence
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    //Retrieve contextual documents (RAG)
    const sources = await this.retrieverService.search(content);

    //Fetch and format previous conversation messages
    const history = await this.getMessagesBySession(sessionId, {
      limit: 20,
      offset: 0,
      search: content,
    });

    // Format history specific to the content for more contextual information
    const formattedHistory = history
      .map((msg) => `${msg.sender}: ${msg.content}`)
      .join('\n');

    //Save current user message along with context
    await this.addMessage(sessionId, sender, content, sources);

    //Prepare streaming response headers
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    const sourcesText = sources
      .map((s) => s.snippet)
      .join('\n\n')
      .replace(/[\r\n]+/g, ' ')
      .replace(/"/g, '\\"');

    //Send prompt, context, and history to generator
    await this.generatorService.streamReply(
      {
        history: formattedHistory,
        prompt: content,
        sources: sources.map((s) => s.snippet).join('\n\n'),
      },
      async (chunk) => {
        // 📤 Stream each token/chunk back to client
        finalAnswer += chunk;
        response.write(
          `data: ${JSON.stringify({
            delta: { content: chunk, sources: sourcesText },
            sessionId: sessionId,
          })}\n\n`,
        );
      },
    );

    // Save the final assistant response to DB
    await this.saveAIMessage(sessionId, finalAnswer, sources);

    // Close SSE stream
    response.end();
  }

  async addMessage(
    sessionId: string,
    sender: SenderType,
    content: string,
    sources: Source[],
  ) {
    const message = await this.messageModel.create({
      sessionId: new Types.ObjectId(sessionId),
      sender,
      content,
      sources,
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
    const { limit = 20, offset = 0, search } = query;

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
