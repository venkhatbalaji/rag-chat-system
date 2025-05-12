import { RateLimitGuard } from '../../src/common/guards/rate-limit.guard';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { Logger } from '../../src/logger/logger.service';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'ratelimit.isEnabled': true,
        'rateLimit.windowSeconds': '600',
        'rateLimit.maxRequests': '3',
      };
      return config[key];
    }),
  };

  const mockRedisService = {
    incr: jest.fn(),
    expire: jest.fn(),
  };

  const mockCloudflareService = {
    blockIp: jest.fn(),
  };

  const mockLogger = {
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const createMockContext = (ip = '127.0.0.1') =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-forwarded-for': ip },
          originalUrl: '/api/test',
          method: 'GET',
          connection: { remoteAddress: ip },
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    guard = new RateLimitGuard(
      mockLogger,
      mockConfigService as any,
      mockRedisService as any,
      mockCloudflareService as any,
    );
    jest.clearAllMocks();
  });

  it('should allow request if rate limiting is disabled', async () => {
    mockConfigService.get = jest.fn((key: string) => {
      if (key === 'ratelimit.isEnabled') return false;
      return '3';
    });

    const result = await guard.canActivate(createMockContext());
    expect(result).toBe(true);
  });

  it('should allow request within limit', async () => {
    mockRedisService.incr.mockResolvedValueOnce(1);
    const result = await guard.canActivate(createMockContext());
    expect(result).toBe(true);
  });

  it('should allow request if Redis fails (fail-open)', async () => {
    mockRedisService.incr.mockRejectedValue(new Error('Redis error'));
    const result = await guard.canActivate(createMockContext());
    expect(result).toBe(true);
  });
});
