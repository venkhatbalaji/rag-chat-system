import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../../src/chat/chat.service';
import { ChatController } from '../../src/chat/chat.controller';
import { RetrieverService } from '../../src/mock/service/retriever.service';
import { GeneratorService } from '../../src/mock/service/generator.service';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from '../../src/chat/schemas/message.schema';
import { Session } from '../../src/session/schemas/session.schema';

describe('ChatModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        ChatService,
        {
          provide: getModelToken(Message.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken(Session.name),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: RetrieverService,
          useValue: { search: jest.fn() },
        },
        {
          provide: GeneratorService,
          useValue: { streamReply: jest.fn() },
        },
      ],
    }).compile();
  });

  it('should compile the module', () => {
    const chatService = module.get<ChatService>(ChatService);
    expect(chatService).toBeDefined();
  });
});
