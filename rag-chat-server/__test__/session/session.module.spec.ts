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
import { CloudflareService } from '../../src/common/cloudflare/cloudflare.service';
import { ConfigService } from '@nestjs/config';
import { HttpServiceWrapper } from '../../src/common/http/http.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RateLimitGuard } from '../../src/common/guards/rate-limit.guard';
import { RedisService } from '../../src/common/redis/redis.service';

describe('SessionModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
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
          useValue: {},
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
                'rateLimit.maxRequestsPerSec': 2,
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
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
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

  it('should compile the module and expose SessionService and SessionController', () => {
    const service = module.get<SessionService>(SessionService);
    const controller = module.get<SessionController>(SessionController);

    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });
});
