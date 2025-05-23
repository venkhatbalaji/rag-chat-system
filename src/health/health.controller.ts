import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('health')
@ApiSecurity('API_KEY')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private mongo: MongooseHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('postgresql'),
      () => this.mongo.pingCheck('mongodb'),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
