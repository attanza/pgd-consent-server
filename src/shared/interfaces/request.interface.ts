import { Request } from 'express';
import { UserDocument } from '../../user/user.schema';

export interface IRequest extends Request {
  user: UserDocument;
}
