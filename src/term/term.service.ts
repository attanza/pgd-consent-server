import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pagination } from 'mongoose-paginate-ts';
import { CheckListService } from 'src/check-list/check-list.service';
import { BaseService } from '../shared/services/base.service';
import { Term, TermDocument } from './term.schema';

@Injectable()
export class TermService extends BaseService<TermDocument> {
  constructor(
    @InjectModel(Term.name) private model: Pagination<TermDocument>,
    private readonly checkListService: CheckListService,
  ) {
    super(model);
  }

  async checkListExists(ids: string[]) {
    await this.checkListService.shouldExists(ids);
  }
}
