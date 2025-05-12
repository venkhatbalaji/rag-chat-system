import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { Session } from './session/schemas/session.schema';
import { Message } from './chat/schemas/message.schema';
import { HealthModule } from './health/health.module';
import { CloudflareService } from './common/cloudflare/cloudflare.service';
import { HttpServiceWrapper } from './common/http/http.service';
import { HttpModule } from '@nestjs/axios';
import { WinstonModule } from 'nest-winston';
import { createWinstonLoggerConfig } from './logger/winston.logger';
import { RedisModule } from './common/redis/redis.module';
import { SessionModule } from './session/session.module';
import { ChatModule } from './chat/chat.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { Document } from './mock/entities/document.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const appName = config.get<string>('appName');
        return createWinstonLoggerConfig(appName);
      },
    }),
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        entities: [Document],
        synchronize: config.get<string>('env') === 'development',
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    HealthModule,
    SessionModule,
    ChatModule,
  ],
  providers: [HttpServiceWrapper, CloudflareService, ConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: '/health', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}
