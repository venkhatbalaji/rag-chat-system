import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategy/google.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { RedisModule } from '../common/redis/redis.module';
import { HttpServiceWrapper } from '../common/http/http.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, HttpServiceWrapper],
  exports: [AuthService],
})
export class AuthModule {}
