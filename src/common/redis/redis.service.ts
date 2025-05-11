import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { RedisStore } from 'connect-redis';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from '../../logger/logger.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClient;
  private redisStore: RedisStore;
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly config: ConfigService,
  ) {
    this.redisClient = new Redis({
      host: this.config.get<string>('redis.host'),
      port: this.config.get<number>('redis.port'),
      username: this.config.get<string>('redis.username'),
    });
    this.redisClient.on('connect', () => {
      this.logger.log(
        'Connected to Redis!',
        JSON.stringify({
          time: new Date(),
          host: this.config.get<string>('redis.host'),
          port: this.config.get<number>('redis.port'),
        }),
      );
    });
    this.redisClient.on('error', (err) => {
      this.logger.error(
        'Redis connection error:',
        JSON.stringify({
          message: err.message,
          stack: err.stack,
          time: new Date(),
        }),
      );
    });
    this.redisStore = new RedisStore({
      client: this.redisClient as any,
      prefix: `finstreet-${this.config.get<string>('env')}:`,
    });
  }

  async onModuleInit() {
    if (this.redisClient.status !== 'ready') {
      this.logger.log('Redis: waiting for connection...');
      await new Promise<void>((resolve, reject) => {
        this.redisClient.once('ready', () => {
          resolve();
        });
        this.redisClient.once('error', (err) => {
          reject(err);
        });
      });
    }
  }

  async onModuleDestroy() {
    try {
      await this.redisClient.quit();
      this.logger.log('Redis: disconnected');
    } catch (err) {
      this.logger.error('Redis: disconnect error', err.message);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      this.logger.error('Redis-Get', err.message);
      return null;
    }
  }

  async set(key: string, value: any): Promise<boolean> {
    try {
      await this.redisClient.set(key, JSON.stringify(value));
      return true;
    } catch (err) {
      this.logger.error('Redis-Set', err.message);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.redisClient.del(key);
      return true;
    } catch (err) {
      this.logger.error('Redis-Delete', err.message);
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.redisClient.incr(key);
    } catch (err) {
      this.logger.error('Redis-Incr', err.message);
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      await this.redisClient.expire(key, seconds);
      return true;
    } catch (err) {
      this.logger.error('Redis-Expire', err.message);
      return false;
    }
  }

  getSessionStore(): RedisStore {
    return this.redisStore;
  }
}
