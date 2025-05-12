import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Message, MessageSchema } from '../chat/schemas/message.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session, SessionSchema } from '../session/schemas/session.schema';
import { GeneratorService } from '../mock/service/generator.service';
import { RetrieverService } from '../mock/service/retriever.service';
import { Document } from '../mock/entities/document.entity';
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
    TypeOrmModule.forFeature([Document]),
  ],
  controllers: [ChatController],
  providers: [
    ConfigService,
    HttpServiceWrapper,
    ChatService,
    RetrieverService,
    GeneratorService,
    CloudflareService,
  ],
})
export class ChatModule {}
