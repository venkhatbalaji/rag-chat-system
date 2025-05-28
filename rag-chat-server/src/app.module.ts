import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { CloudflareService } from './common/cloudflare/cloudflare.service';
import { HttpServiceWrapper } from './common/http/http.service';
import { HttpModule } from '@nestjs/axios';
import { WinstonModule } from 'nest-winston';
import { createWinstonLoggerConfig } from './logger/winston.logger';
import { RedisModule } from './common/redis/redis.module';
import { SessionModule } from './session/session.module';
import { ChatModule } from './chat/chat.module';
import { JwtMiddleware } from './common/middleware/jwt.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: { expiresIn: '1h' },
      }),
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
    AuthModule,
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
      .apply(JwtMiddleware)
      .exclude({ path: '/health', method: RequestMethod.ALL })
      .exclude({ path: '/auth/login', method: RequestMethod.ALL })
      .exclude({ path: '/auth/google', method: RequestMethod.ALL })
      .exclude({ path: '/auth/google/callback', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
