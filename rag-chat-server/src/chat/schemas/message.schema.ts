import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

export enum SenderType {
  USER = 'user',
  AGENT = 'agent',
}

export enum ModelType {
  DEEPSEEK = 'deepseek-coder',
  OPENCHAT = 'openchat',
}

export interface Source {
  snippet: string;
  source: string;
  similarityScore: Number;
}

@Schema({
  versionKey: false,
  timestamps: { createdAt: true, updatedAt: false },
})
export class Message {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Session',
    required: true,
  })
  sessionId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: ModelType, required: false })
  model?: ModelType;

  @Prop({
    enum: SenderType,
    default: SenderType.USER,
    required: true,
  })
  sender: SenderType;

  @Prop({ type: Object, required: false, select: false })
  sources: Source[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
export type MessageDocument = Message & Document;
