import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pagination } from 'mongoose-paginate-ts';
import { AuditTrailsService } from 'src/audit-trails/audit-trails.service';

import { BaseService } from '../shared/services/base.service';
import { CheckList, CheckListDocument } from './check-list.schema';

@Injectable()
export class CheckListService extends BaseService<CheckListDocument> {
  constructor(@InjectModel(CheckList.name) private model: Pagination<CheckListDocument>) {
    super(model);
  }
}
