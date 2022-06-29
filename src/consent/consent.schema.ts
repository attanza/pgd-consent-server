import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { CheckList } from 'src/check-list/check-list.schema';

import { Term } from '../term/term.schema';
import { MINIO_URL } from '../utils/constants';

export type ConsentDocument = Consent & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (_, ret) {
      const attachments = [];
      ret.attachments.map((a) => {
        attachments.push(MINIO_URL + a);
      });
      ret.attachments = attachments;
      return ret;
    },
  },
})
export class Consent {
  @Prop({
    index: true,
  })
  nik: string;

  @Prop({
    index: true,
  })
  cif: string;

  @Prop({
    index: true,
  })
  email: string;

  @Prop({
    index: true,
  })
  phone: string;

  @Prop()
  name: string;

  @Prop()
  source: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Term' })
  term: Term;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'CheckList' }])
  checkLists: CheckList[];

  @Prop()
  attachments: string[];
}

export const ConsentSchema = SchemaFactory.createForClass(Consent);
