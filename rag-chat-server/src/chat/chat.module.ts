import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Message, MessageSchema } from '../chat/schemas/message.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from '../session/schemas/session.schema';
import { RedisModule } from '../common/redis/redis.module';
import { CloudflareService } from '../common/cloudflare/cloudflare.service';
import { ConfigService } from '@nestjs/config';
import { HttpServiceWrapper } from '../common/http/http.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    RedisModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [
    ConfigService,
    HttpServiceWrapper,
    ChatService,
    CloudflareService,
  ],
})
export class ChatModule {}
