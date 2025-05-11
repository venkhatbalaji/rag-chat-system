import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Message, MessageSchema } from '../chat/schemas/message.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session, SessionSchema } from 'src/session/schemas/session.schema';
import { GeneratorService } from '../mock/service/generator.service';
import { RetrieverService } from '../mock/service/retriever.service';
import { Document } from '../mock/entities/document.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    TypeOrmModule.forFeature([Document]),
  ],
  controllers: [ChatController],
  providers: [ChatService, RetrieverService, GeneratorService],
})
export class ChatModule {}
