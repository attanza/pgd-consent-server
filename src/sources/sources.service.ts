import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pagination } from 'mongoose-paginate-ts';
import { BaseService } from '../shared/services/base.service';
import { Source, SourceDocument } from './source.schema';
import crypto from 'crypto';
@Injectable()
export class SourcesService extends BaseService<SourceDocument> {
  constructor(@InjectModel(Source.name) private model: Pagination<SourceDocument>) {
    super(model);
  }

  generateSecret() {
    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('hex');
    return { clientId, clientSecret };
  }

  async findInIds(ids: string[], select: string) {
    return this.model.find({ _id: { $in: ids } }).select(select);
  }
}
