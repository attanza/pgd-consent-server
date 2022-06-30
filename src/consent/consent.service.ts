import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isMongoId } from 'class-validator';
import { Pagination } from 'mongoose-paginate-ts';
import { CheckListDocument } from '../check-list/check-list.schema';
import { Term } from '../term/term.schema';

import { MinioClientService } from 'src/minio-client/minio-client.service';
import { BaseService } from '../shared/services/base.service';
import { TermService } from '../term/term.service';
import { CreateConsentDto, UpdateConsentDto } from './consent.dto';
import { Consent, ConsentDocument } from './consent.schema';
import * as crypto from 'crypto';
import { QueuesService } from '../queues/queues.service';
import { IFIleUploadData } from 'src/shared/interfaces/file-upload.interface';
@Injectable()
export class ConsentService extends BaseService<ConsentDocument> {
  constructor(
    @InjectModel(Consent.name) private model: Pagination<ConsentDocument>,
    private readonly termService: TermService,
    private readonly queueService: QueuesService,
    private readonly minioService: MinioClientService,
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

  async createOrUpdate(dto: CreateConsentDto | UpdateConsentDto): Promise<ConsentDocument> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(`${this.model.modelName} not found`);
    }
    let found: ConsentDocument;
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
    } else {
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

  async addAttachment(id: string, file: Express.Multer.File) {
    if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
      throw new BadRequestException('File type not supported');
    }
    const timestamp = Date.now().toString();
    const hashedFileName = crypto.createHash('md5').update(timestamp).digest('hex');
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );

    // We need to append the extension at the end otherwise Minio will save it as a generic file
    const filename = hashedFileName + extension;
    const fileUploadData: IFIleUploadData = {
      id,
      buffer: file.buffer,
      filename,
      mimetype: file.mimetype,
      size: file.size,
    };
    console.log('fileUploadData', fileUploadData);

    // await this.queueService.fileUpload(fileUploadData);
    await this.minioService.upload(file.buffer, filename, file.mimetype, file.size);
  }
}
