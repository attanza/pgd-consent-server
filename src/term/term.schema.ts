import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { CheckList } from '../check-list/check-list.schema';

export type TermDocument = Term & Document;

@Schema({
  timestamps: true,
})
export class Term {
  @Prop({
    unique: true,
  })
  title: string;

  @Prop()
  content: string;

  @Prop({ default: false })
  isPublish: boolean;

  @Prop()
  source: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'CheckList' }])
  checkLists: CheckList[];
}

export const TermSchema = SchemaFactory.createForClass(Term);
