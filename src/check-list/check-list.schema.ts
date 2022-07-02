import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Source } from '../sources/source.schema';

export type CheckListDocument = CheckList & Document;

@Schema({
  timestamps: true,
})
export class CheckList {
  @Prop({ unique: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Source' })
  source: Source;
}

export const CheckListSchema = SchemaFactory.createForClass(CheckList);
