import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isMongoId } from 'class-validator';
import { Pagination } from 'mongoose-paginate-ts';
import { CheckListDocument } from '../check-list/check-list.schema';
import { Term } from '../term/term.schema';

import { BaseService } from '../shared/services/base.service';
import { TermService } from '../term/term.service';
import { CreateConsentDto, UpdateConsentDto } from './consent.dto';
import { Consent, ConsentDocument } from './consent.schema';
import { AddAttachmentEvent } from 'src/events/add-attachment.event';
import { AuditTrailsService } from 'src/audit-trails/audit-trails.service';
import { IRequest } from 'src/shared/interfaces/request.interface';
import { generateAuditData } from 'src/utils/generate-audit-data';
import { EResourceAction } from 'src/shared/interfaces/resource-action';
@Injectable()
export class ConsentService extends BaseService<ConsentDocument> {
  private resource = 'Consent';

  constructor(
    @InjectModel(Consent.name) private model: Pagination<ConsentDocument>,
    private readonly termService: TermService,
    private readonly auditService: AuditTrailsService,
  ) {
    super(model);
  }

  async checkTerm(id: string) {
    const term: Term = await this.termService.findOrFail({ _id: id }, {}, {}, 'checkLists');
    if (!term) {
      throw new UnprocessableEntityException('Term not found');
    }
    return term;
  }

  async createOrUpdate(
    dto: CreateConsentDto | UpdateConsentDto,
    req: IRequest,
  ): Promise<ConsentDocument> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(`${this.model.modelName} not found`);
    }
    let found: ConsentDocument;
    let oldData: ConsentDocument;
    const keys = ['nik', 'phone', 'email', 'cif'];
    const or: any = [];
    Object.keys(dto).map((d) => {
      if (keys.includes(d) && dto[d]) {
        or.push({ [d]: dto[d] });
      }
    });
    found = await this.findOne({ $or: or });
    if (!found) {
      found = await this.create(dto, keys);
      const auditData = generateAuditData(req, EResourceAction.CREATE, this.resource, found);
      this.auditService.auditTrail(auditData);
    } else {
      oldData = Object.assign({}, found);
      if (dto.term) {
        const term = await this.checkTerm(dto.term);
        const checkListString: string[] = [];
        term.checkLists.forEach((c: CheckListDocument) => checkListString.push(c._id.toString()));

        let checkListIncluded = true;
        if (dto.checkLists && dto.checkLists.length > 0) {
          dto.checkLists.forEach((c: string) => {
            if (!checkListString.includes(c)) {
              checkListIncluded = false;
            }
          });
          console.log('checkListIncluded', checkListIncluded);

          if (!checkListIncluded) {
            throw new UnprocessableEntityException('One or more check list is invalid');
          }
        }
      }
      Object.keys(dto).map((d) => {
        if (dto[d]) {
          found[d] = dto[d];
        }
      });
      await found.save();
      const auditData = generateAuditData(
        req,
        EResourceAction.UPDATE,
        this.resource,
        found,
        oldData,
      );
      this.auditService.auditTrail(auditData);
    }

    return found;
  }

  async getConsent(id: string) {
    let found: any;
    if (isMongoId(id)) {
      found = await this.model
        .findById(id)
        .populate({
          path: 'term',
          select: 'title content',
          populate: { path: 'checkLists' },
        })
        .exec();
    } else {
      const searchable = ['nik', 'phone', 'email'];
      const or: any = [];
      searchable.map((s) => {
        or.push({ [s]: id });
      });
      found = await this.model
        .findOne({ $or: or })
        .populate({
          path: 'term',
          select: 'title content',
        })
        .exec();
    }
    if (!found) {
      throw new BadRequestException(`${this.model.modelName} not found`);
    }
    return found;
  }

  async handleAttachment(data: AddAttachmentEvent) {
    const { resourceId, fileName } = data;
    const consent = await this.findById<ConsentDocument>(resourceId);
    if (consent) {
      consent.attachments.push(fileName);
      await consent.save();
    }
  }
}
