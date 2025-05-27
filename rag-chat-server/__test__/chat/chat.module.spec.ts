import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../../src/chat/chat.service';
import { ChatController } from '../../src/chat/chat.controller';
import { RetrieverService } from '../../src/mock/service/retriever.service';
import { GeneratorService } from '../../src/mock/service/generator.service';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from '../../src/chat/schemas/message.schema';
import { Session } from '../../src/session/schemas/session.schema';
import { CloudflareService } from '../../src/common/cloudflare/cloudflare.service';
import { ConfigService } from '@nestjs/config';
import { HttpServiceWrapper } from '../../src/common/http/http.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RateLimitGuard } from '../../src/common/guards/rate-limit.guard';
import { RedisService } from '../../src/common/redis/redis.service';

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
        {
          provide: CloudflareService,
          useValue: {
            blockIp: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const defaults = {
                'ratelimit.isEnabled': true,
                'rateLimit.maxRequestsPerSec': 10,
                'rateLimit.tempBlockDuration': 30,
                'rateLimit.abuseThreshold': 10,
                'rateLimit.maxSec': 10,
              };
              return defaults[key];
            }),
          },
        },
        {
          provide: HttpServiceWrapper,
          useValue: { get: jest.fn(), post: jest.fn() },
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: RateLimitGuard,
          useValue: {
            canActivate: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            incr: jest.fn(),
            expire: jest.fn(),
          },
        },
      ],
    }).compile();
  });

  it('should compile the module', () => {
    const chatService = module.get<ChatService>(ChatService);
    expect(chatService).toBeDefined();
  });
});
