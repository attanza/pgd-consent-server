import { User } from '../../user/user.schema';
import { Request } from 'express';

export interface IRequest extends Request {
  user: User;
}
