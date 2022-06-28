import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pagination } from 'mongoose-paginate-ts';
import { BaseService } from '../shared/services/base.service';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService extends BaseService<UserDocument> {
  constructor(@InjectModel(User.name) private model: Pagination<UserDocument>) {
    super(model);
  }
}
