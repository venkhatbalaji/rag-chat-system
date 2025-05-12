import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from '../../src/session/session.service';
import { SessionController } from '../../src/session/session.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Session } from '../../src/session/schemas/session.schema';
import { Message } from '../../src/chat/schemas/message.schema';
import { RetrieverService } from '../../src/mock/service/retriever.service';
import { GeneratorService } from '../../src/mock/service/generator.service';
import { ChatService } from '../../src/chat/chat.service';
import { Document } from '../../src/mock/entities/document.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SessionModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [],
      controllers: [SessionController],
      providers: [
        SessionService,
        ChatService,
        {
          provide: RetrieverService,
          useValue: { search: jest.fn() },
        },
        {
          provide: GeneratorService,
          useValue: { streamReply: jest.fn() },
        },
        {
          provide: getModelToken(Session.name),
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken(Message.name),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Document),
          useValue: {}, // mock TypeORM repository
        },
      ],
    }).compile();
  });

  it('should compile the module and expose SessionService', () => {
    const service = module.get<SessionService>(SessionService);
    const controller = module.get<SessionController>(SessionController);

    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });
});
