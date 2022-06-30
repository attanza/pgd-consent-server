import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pagination } from 'mongoose-paginate-ts';
import { BaseService } from 'src/shared/services/base.service';
import { Attachment, AttachmentDocument } from './attachment.schema';

@Injectable()
export class AttachmentsService extends BaseService<AttachmentDocument> {
  constructor(@InjectModel(Attachment.name) private model: Pagination<AttachmentDocument>) {
    super(model);
  }
}
