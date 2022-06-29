import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EUserRole } from '../shared/interfaces/user-role.enum';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (_, ret) {
      delete ret['password'];
      return ret;
    },
  },
})
export class User {
  @Prop()
  name: string;

  @Prop({
    unique: true,
  })
  email: string;

  @Prop()
  password: string;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({ default: EUserRole.VIEWER })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
