import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../../src/chat/chat.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  Message,
  SenderType,
  Source,
} from '../../src/chat//schemas/message.schema';
import { Session } from '../../src//session/schemas/session.schema';
import { RetrieverService } from '../../src/mock/service/retriever.service';
import { GeneratorService } from '../../src/mock/service/generator.service';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Response } from 'express';

describe('ChatService', () => {
  let chatService: ChatService;

  const mockMessageModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockSessionModel = {
    findById: jest.fn(),
  };

  const mockRetrieverService = {
    search: jest.fn(),
  };

  const mockGeneratorService = {
    streamReply: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getModelToken(Message.name), useValue: mockMessageModel },
        { provide: getModelToken(Session.name), useValue: mockSessionModel },
        { provide: RetrieverService, useValue: mockRetrieverService },
        { provide: GeneratorService, useValue: mockGeneratorService },
      ],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('addMessage', () => {
    it('should call messageModel.create with correct data', async () => {
      const sessionId = new Types.ObjectId().toHexString();
      const sender = SenderType.USER;
      const content = 'Hello!';
      const sources = [{ snippet: 'doc1', source: 'kb' }] as Source[];

      const mockMessage = { _id: 'msg123', content };
      mockMessageModel.create.mockResolvedValue(mockMessage);

      const result = await chatService.addMessage(
        sessionId,
        sender,
        content,
        sources,
      );
      expect(mockMessageModel.create).toHaveBeenCalledWith({
        sessionId: new Types.ObjectId(sessionId),
        sender,
        content,
        sources,
      });
      expect(result).toEqual(mockMessage);
    });
  });

  describe('saveAIMessage', () => {
    it('should create an AI message', async () => {
      const sessionId = 'session123';
      const content = 'AI reply here';
      const sources = [];

      const mockMsg = { content, sender: 'agent' };
      mockMessageModel.create.mockResolvedValue(mockMsg);

      const result = await chatService.saveAIMessage(
        sessionId,
        content,
        sources,
      );
      expect(result).toEqual(mockMsg);
      expect(mockMessageModel.create).toHaveBeenCalledWith({
        sessionId,
        sender: 'agent',
        content,
        sources,
      });
    });
  });

  describe('getMessagesBySession', () => {
    it('should return messages without search filter', async () => {
      const sessionId = new Types.ObjectId().toHexString();
      const messages = [{ toObject: () => ({ content: 'Hi' }) }];

      mockMessageModel.exec.mockResolvedValue(messages);

      const result = await chatService.getMessagesBySession(sessionId, {
        limit: 10,
        offset: 0,
      });
      expect(result).toEqual([{ content: 'Hi' }]);
    });

    it('should apply search filters correctly', async () => {
      const sessionId = new Types.ObjectId().toHexString();
      mockMessageModel.exec.mockResolvedValue([
        { toObject: () => ({ content: 'search match' }) },
      ]);

      const result = await chatService.getMessagesBySession(sessionId, {
        limit: 10,
        offset: 0,
        search: 'search',
      });

      expect(result).toEqual([{ content: 'search match' }]);
      expect(mockMessageModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
        }),
      );
    });
  });

  describe('processMessage', () => {
    it('should process and store message with response stream', async () => {
      const sessionId = new Types.ObjectId().toHexString();
      const content = 'Hi';
      const sender = SenderType.USER;
      const sources = [{ snippet: 'doc1', source: 'kb' }] as Source[];
      const history = [{ sender: 'user', content: 'old message' }];

      mockSessionModel.findById.mockResolvedValue({ _id: sessionId });
      mockRetrieverService.search.mockResolvedValue(sources);
      mockMessageModel.exec.mockResolvedValue(
        history.map((msg) => ({ toObject: () => msg })),
      );
      mockMessageModel.create.mockResolvedValue({}); // for addMessage & saveAIMessage
      mockGeneratorService.streamReply.mockImplementation(async (_, cb) => {
        await cb('AI chunk 1');
        await cb('AI chunk 2');
      });

      const res = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as unknown as Response;

      await chatService.processMessage(sessionId, sender, content, res);

      expect(res.write).toHaveBeenCalledTimes(2);
      expect(res.end).toHaveBeenCalled();
    });

    it('should throw NotFoundException if session not found', async () => {
      mockSessionModel.findById.mockResolvedValue(null);

      const res = {} as Response;
      await expect(
        chatService.processMessage(
          'missingSession',
          SenderType.USER,
          'hello',
          res,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
