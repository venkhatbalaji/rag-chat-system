import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../chat/schemas/message.schema';
import { Session, SessionSchema } from './schemas/session.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratorService } from '../mock/service/generator.service';
import { RetrieverService } from '../mock/service/retriever.service';
import { Document } from '../mock/entities/document.entity';
import { ChatService } from 'src/chat/chat.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    TypeOrmModule.forFeature([Document]),
  ],
  controllers: [SessionController],
  providers: [SessionService, ChatService, RetrieverService, GeneratorService],
  exports: [SessionService],
})
export class SessionModule {}
