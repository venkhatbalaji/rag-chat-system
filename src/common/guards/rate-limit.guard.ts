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
  private readonly windowInSeconds: number;
  private readonly maxRequests: number;
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
    );
    this.windowInSeconds = parseInt(
      this.configService.get<string>('rateLimit.windowSeconds') || '600',
      10,
    );
    this.maxRequests = parseInt(
      this.configService.get<string>('rateLimit.maxRequests') || '5',
      10,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.enableRateLimiting) return true;
    const req = context.switchToHttp().getRequest<Request>();
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0]
        : req.connection.remoteAddress;
    const endpoint = req.originalUrl.split('?')[0];
    const method = req.method.toUpperCase();
    const key = `ratelimit:${ip}:${method}:${endpoint}`;
    const allowed = await this.checkAndRecord(key, ip);
    if (!allowed) {
      throw new HttpException(
        createFailureResponse(
          {
            message:
              'Your IP is potentially trying to abuse. Too many requests in short duration. Please contact support.',
          },
          generateErrorCode(HttpStatus.TOO_MANY_REQUESTS),
        ),
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private async checkAndRecord(key: string, ip: string): Promise<boolean> {
    try {
      const count = await this.redisService.incr(key);
      if (count === 1) {
        await this.redisService.expire(key, this.windowInSeconds);
      }
      if (count > this.maxRequests) {
        this.logger.warn(`Rate limit exceeded for ${ip}: ${count} hits`);
        await this.blockAndNotify(ip, count);
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error('RateLimitGuard:checkAndRecord', err.message);
      return true;
    }
  }

  private async blockAndNotify(ip: string, count: number) {
    try {
      const isBlocked = await this.cloudflareService.blockIp(ip);
      if (isBlocked) {
        this.logger.error(`Blocked IP ${ip} on Cloudflare`);
      }
    } catch (err) {
      this.logger.error('RateLimit-Block', err.message);
    }
  }
}
