import { RedisService } from '../../../src/common/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import Redis, { Redis as RedisClient } from 'ioredis';
import { Logger } from '../../../src/logger/logger.service';

const mockRedisClient: any = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  quit: jest.fn(),
  status: 'ready',
  once: jest.fn(),
};

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockRedisClient),
  };
});

jest.mock('connect-redis', () => ({
  RedisStore: jest.fn().mockImplementation(() => ({
    mock: true,
  })),
}));

describe('RedisService', () => {
  let service: RedisService;
  let mockLogger: Logger;
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
    } as unknown as Logger;
    service = new RedisService(mockLogger, mockConfigService as any);
  });

  afterAll(async () => {
    if (service && (service as any).onModuleDestroy) {
      await service.onModuleDestroy();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  service = new RedisService(mockLogger, mockConfigService as any);

  afterEach(() => jest.clearAllMocks());

  it('should set a key successfully', async () => {
    mockRedisClient.set.mockResolvedValue('OK');
    const result = await service.set('key', { test: 'val' });
    expect(result).toBe(true);
  });

  it('should return false if set throws error', async () => {
    mockRedisClient.set.mockRejectedValue(new Error('fail'));
    const result = await service.set('key', { foo: 'bar' });
    expect(result).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith('Redis-Set', 'fail');
  });

  it('should get and parse value', async () => {
    mockRedisClient.get.mockResolvedValue(JSON.stringify({ test: 1 }));
    const result = await service.get<{ test: number }>('key');
    expect(result).toEqual({ test: 1 });
  });

  it('should return null if get fails', async () => {
    mockRedisClient.get.mockRejectedValue(new Error('fail'));
    const result = await service.get('key');
    expect(result).toBeNull();
  });

  it('should delete a key', async () => {
    mockRedisClient.del.mockResolvedValue(1);
    const result = await service.delete('key');
    expect(result).toBe(true);
  });

  it('should return false if delete fails', async () => {
    mockRedisClient.del.mockRejectedValue(new Error('fail'));
    const result = await service.delete('key');
    expect(result).toBe(false);
  });

  it('should increment a key', async () => {
    mockRedisClient.incr.mockResolvedValue(2);
    const result = await service.incr('key');
    expect(result).toBe(2);
  });

  it('should return 0 if incr fails', async () => {
    mockRedisClient.incr.mockRejectedValue(new Error('fail'));
    const result = await service.incr('key');
    expect(result).toBe(0);
  });

  it('should expire a key', async () => {
    mockRedisClient.expire.mockResolvedValue(1);
    const result = await service.expire('key', 60);
    expect(result).toBe(true);
  });

  it('should return false if expire fails', async () => {
    mockRedisClient.expire.mockRejectedValue(new Error('fail'));
    const result = await service.expire('key', 60);
    expect(result).toBe(false);
  });

  it('should wait for connection in onModuleInit if not ready', async () => {
    mockRedisClient.status = 'connecting';
    const mockReady = jest.fn();
    const mockError = jest.fn();
    mockRedisClient.once = jest.fn((event, cb) => {
      if (event === 'ready') mockReady.mockImplementation(cb);
      if (event === 'error') mockError.mockImplementation(cb);
    });

    const delayedService = new RedisService(
      mockLogger,
      mockConfigService as any,
    );
    (delayedService as any).redisClient.status = 'connecting';

    const promise = delayedService.onModuleInit();
    mockRedisClient.once.mock.calls[0][1](); // trigger 'ready'
    await promise;

    expect(mockLogger.log).toHaveBeenCalledWith(
      'Redis: waiting for connection...',
    );
  });

  it('should disconnect Redis on destroy', async () => {
    mockRedisClient.quit.mockResolvedValue('OK');
    await service.onModuleDestroy();
    expect(mockLogger.log).toHaveBeenCalledWith('Redis: disconnected');
  });

  it('should log disconnect error on destroy', async () => {
    mockRedisClient.quit.mockRejectedValue(new Error('disconnect fail'));
    await service.onModuleDestroy();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Redis: disconnect error',
      'disconnect fail',
    );
  });

  it('should return the RedisStore instance', () => {
    const store = service.getSessionStore();
    expect(store).toHaveProperty('mock');
  });
});
