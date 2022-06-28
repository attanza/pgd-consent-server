import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CheckListDocument = CheckList & Document;

@Schema({
  timestamps: true,
})
export class CheckList {
  @Prop({ unique: true })
  content: string;

  @Prop()
  source: string;
}

export const CheckListSchema = SchemaFactory.createForClass(CheckList);
