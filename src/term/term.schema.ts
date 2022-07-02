import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Source } from '../sources/source.schema';

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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Source' })
  source: Source;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'CheckList' }])
  checkLists: CheckList[];
}

export const TermSchema = SchemaFactory.createForClass(Term);
