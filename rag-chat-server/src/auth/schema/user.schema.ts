import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: { createdAt: true, updatedAt: true },
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  name?: string;

  @Prop()
  picture?: string;

  @Prop()
  provider?: string; // e.g., 'google' or 'local'

  @Prop()
  providerId?: string; // e.g., Google sub ID
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;
