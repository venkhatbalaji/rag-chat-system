import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from '../../src/chat/chat.controller';
import { ChatService } from '../../src/chat/chat.service';
import { AddMessageDto } from '../../src/chat/dto/add-message.dto';
import { QueryMessagesDto } from '../../src/chat/dto/query-messages.dto';
import { Response } from 'express';
import { Message, SenderType } from '../../src/chat/schemas/message.schema';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: ChatService;

  const mockChatService = {
    getMessagesBySession: jest.fn(),
    processMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: mockChatService }],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getMessages', () => {
    it('should return paginated messages from a session', async () => {
      const sessionId = '123';
      const query: QueryMessagesDto = { limit: 10, offset: 0 };
      const mockMessages: Message[] = [
        { content: 'Hello', sender: SenderType.USER, sessionId } as Message,
      ];

      mockChatService.getMessagesBySession.mockResolvedValue(mockMessages);

      const result = await controller.getMessages(sessionId, query);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMessages);
      expect(mockChatService.getMessagesBySession).toHaveBeenCalledWith(
        sessionId,
        query,
      );
    });
  });

  describe('addMessage', () => {
    it('should call processMessage with correct arguments', async () => {
      const sessionId = 'abc123';
      const dto: AddMessageDto = {
        content: 'Hello AI!',
        sender: SenderType.AGENT,
      };

      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as unknown as Response;

      await controller.addMessage(sessionId, dto, mockRes);

      expect(mockChatService.processMessage).toHaveBeenCalledWith(
        sessionId,
        dto.sender,
        dto.content,
        mockRes,
      );
    });
  });
});
