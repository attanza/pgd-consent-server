import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SourceDocument = Source & Document;

@Schema({
  timestamps: true,
})
export class Source {
  @Prop({ index: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  idAddresses: string[];

  @Prop()
  clientId: string;

  @Prop()
  clientSecret: string;
}

export const SourceSchema = SchemaFactory.createForClass(Source);
