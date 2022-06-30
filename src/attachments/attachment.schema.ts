import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AttachmentDocument = Attachment & Document;

@Schema({
  timestamps: true,
})
export class Attachment {
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Consent' }])
  consent: string;

  @Prop()
  filename: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
