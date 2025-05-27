import { Test, TestingModule } from '@nestjs/testing';
import { SessionController } from '../../src/session/session.controller';
import { SessionService } from '../../src/session/session.service';
import { CreateSessionDto } from '../../src/session/dto/create-session.dto';
import { UpdateSessionDto } from '../../src/session/dto/update-session.dto';
import { QuerySessionsDto } from '../../src/session/dto/query-sessions.dto';
import { Response as ExpressResponse } from 'express';
import { DeleteResult } from 'mongodb';
import { RateLimitGuard } from '../../src/common/guards/rate-limit.guard';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { RedisService } from '../../src/common/redis/redis.service';
import { CloudflareService } from '../../src/common/cloudflare/cloudflare.service';

describe('SessionController', () => {
  let controller: SessionController;
  let sessionService: SessionService;

  const mockSessionService = {
    getSessions: jest.fn(),
    createSession: jest.fn(),
    deleteSession: jest.fn(),
    updateSession: jest.fn(),
  };
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          timeout: 10000,
          maxRedirects: 5,
        }),
      ],
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
        {
          provide: RateLimitGuard,
          useValue: { canActivate: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
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
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            incr: jest.fn(),
            expire: jest.fn(),
          },
        },
        {
          provide: CloudflareService,
          useValue: {
            blockIp: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<SessionController>(SessionController);
    sessionService = module.get<SessionService>(SessionService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSessions', () => {
    it('should return list of sessions', async () => {
      const query: QuerySessionsDto = { userId: 'user1', limit: 10, offset: 0 };
      const mockSessions = [{ title: 'Session 1' }, { title: 'Session 2' }];

      mockSessionService.getSessions.mockResolvedValue(mockSessions);

      const result = await controller.getSessions(query);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSessions);
      expect(sessionService.getSessions).toHaveBeenCalledWith(query);
    });
  });

  describe('create', () => {
    it('should call createSession with userId and title', async () => {
      const dto: CreateSessionDto = {
        userId: 'user123',
        title: 'New Session',
      };

      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as unknown as ExpressResponse;

      await controller.create(dto, mockRes);
      expect(sessionService.createSession).toHaveBeenCalledWith(
        dto.userId,
        dto.title,
        mockRes,
      );
    });
  });

  describe('delete', () => {
    it('should delete session and return success response', async () => {
      const sessionId = 'abc123';
      const mockResult: DeleteResult = { acknowledged: true, deletedCount: 1 };

      mockSessionService.deleteSession.mockResolvedValue(mockResult);

      const result = await controller.delete(sessionId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(sessionService.deleteSession).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('update', () => {
    it('should update a session and return it', async () => {
      const sessionId = 'abc123';
      const dto: UpdateSessionDto = {
        title: 'Updated Title',
        isFavorite: true,
      };
      const mockSession = {
        _id: sessionId,
        title: 'Updated Title',
        isFavorite: true,
      };

      mockSessionService.updateSession.mockResolvedValue(mockSession);

      const result = await controller.update(sessionId, dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSession);
      expect(sessionService.updateSession).toHaveBeenCalledWith(sessionId, dto);
    });
  });
});
