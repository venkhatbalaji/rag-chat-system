import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from '../../../src/common/redis/redis.module';
import { RedisService } from '../../../src/common/redis/redis.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from '../../../src/logger/logger.service';
import { ConfigService } from '@nestjs/config';

describe('RedisModule', () => {
  let module: TestingModule;
  let redisService: RedisService;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'redis.host': 'localhost',
        'redis.port': 6379,
        'redis.username': '',
        env: 'test',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
  });

  it('should compile and provide RedisService', () => {
    expect(redisService).toBeDefined();
  });
});
