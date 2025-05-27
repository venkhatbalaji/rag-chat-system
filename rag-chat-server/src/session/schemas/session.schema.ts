import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: { createdAt: true, updatedAt: false },
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Session extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: false })
  isFavorite: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'sessionId',
});
export type SessionDocument = Session & Document;
