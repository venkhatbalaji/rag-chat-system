import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { CloudflareService } from '../cloudflare/cloudflare.service';
import { createFailureResponse } from '../utils/response.util';
import { generateErrorCode } from '../utils/error-code.util';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from '../../logger/logger.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly maxRequestsPerSec: number;
  private readonly tempBlockDuration: number;
  private readonly abuseThreshold: number;
  private readonly maxSec: number;
  private readonly enableRateLimiting: boolean;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly cloudflareService: CloudflareService,
  ) {
    this.enableRateLimiting = this.configService.get<boolean>(
      'ratelimit.isEnabled',
      true,
    );
    this.maxRequestsPerSec = this.configService.get<number>(
      'rateLimit.maxRequestsPerSec',
      10,
    );
    this.tempBlockDuration = this.configService.get<number>(
      'rateLimit.tempBlockDuration',
      60,
    );
    this.abuseThreshold = this.configService.get<number>(
      'rateLimit.abuseThreshold',
      10,
    );
    this.maxSec = this.configService.get<number>('rateLimit.maxSec', 10);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.enableRateLimiting) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const ip = this.extractIp(req);
    const endpoint = req.originalUrl.split('?')[0];
    const method = req.method.toUpperCase();

    const rateKey = `ratelimit:${ip}:${method}:${endpoint}`;
    const blockKey = `ratelimit:block:${ip}`;
    const abuseKey = `ratelimit:abuse:${ip}`;

    // 1. Check temporary block
    const isBlocked = await this.redisService.get(blockKey);
    if (isBlocked) {
      req.res?.setHeader('Retry-After', this.tempBlockDuration.toString());
      this.logger.warn(`IP ${ip} is temporarily blocked`);
      throw this.tooManyRequestsException();
    }

    // 2. Track requests per second
    const requestCount = await this.redisService.incr(rateKey);
    if (requestCount === 1) {
      await this.redisService.expire(rateKey, this.maxSec);
    }

    // 3. If rate exceeds limit
    if (requestCount > this.maxRequestsPerSec) {
      this.logger.warn(`Rate limit exceeded: IP=${ip}, Count=${requestCount}`);

      // Temp block IP
      await this.redisService.set(blockKey, '1');
      await this.redisService.expire(blockKey, this.tempBlockDuration);

      // Increase abuse count
      const abuseCount = await this.redisService.incr(abuseKey);
      if (abuseCount === 1) {
        await this.redisService.expire(abuseKey, 3600); // abuse record expires after 1 hour
      }

      // Cloudflare permanent block
      if (abuseCount >= this.abuseThreshold) {
        this.logger.warn(
          `Abuse detected: IP=${ip}, AbuseCount=${abuseCount}. Permanent block initiated.`,
        );
        this.logger.error(`Cloudflare permanent block triggered for IP ${ip}`);
        await this.permanentlyBlockIp(ip);
      }

      throw this.tooManyRequestsException();
    }

    return true;
  }

  private extractIp(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    return typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : req.socket.remoteAddress || 'unknown';
  }

  private tooManyRequestsException(): HttpException {
    return new HttpException(
      createFailureResponse(
        {
          message:
            'Too many requests. You are temporarily blocked due to potential abuse. Please try again later.',
        },
        generateErrorCode(HttpStatus.TOO_MANY_REQUESTS),
      ),
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  private async permanentlyBlockIp(ip: string) {
    try {
      const result = await this.cloudflareService.blockIp(ip);
      if (result) {
        this.logger.error(`Cloudflare permanently blocked IP ${ip}`);
      }
    } catch (err) {
      this.logger.error('Cloudflare block failed', err.message);
    }
  }
}
