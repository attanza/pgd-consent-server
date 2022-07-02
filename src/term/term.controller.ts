import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';

import { AuditTrailsService } from 'src/audit-trails/audit-trails.service';
import { Roles } from '../shared/guards/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guard';
import { IRequest } from '../shared/interfaces/request.interface';
import { EResourceAction } from '../shared/interfaces/resource-action';
import { EUserRole } from '../shared/interfaces/user-role.enum';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { generateAuditData } from '../utils/generate-audit-data';
import {
  responseCollection,
  responseCreate,
  responseDelete,
  responseDetail,
  responseUpdate,
} from '../utils/response-parser';
import { CreateTermDto, UpdateTermDto } from './term.dto';
import { TermService } from './term.service';
import { SourcesService } from 'src/sources/sources.service';

@UseGuards(RolesGuard)
@Controller('terms')
export class TermController {
  private resource = 'Term';
  constructor(
    private readonly service: TermService,
    private readonly auditService: AuditTrailsService,
    private readonly sourceService: SourcesService,
  ) {}

  @Get()
  async paginate(@Query() query: ResourcePaginationPipe) {
    const result = await this.service.paginate(query, ['title', 'source']);
    return responseCollection(this.resource, result);
  }

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.EDITOR)
  async create(@Body() data: CreateTermDto, @Req() req: IRequest) {
    if (data.checkLists) {
      await this.service.checkListExists(data.checkLists);
    }
    if (data.source) {
      await this.sourceService.getById(data.source);
    }
    const result = await this.service.create(data, ['title']);
    const auditData = generateAuditData(req, EResourceAction.CREATE, this.resource, result);
    this.auditService.auditTrail(auditData);
    return responseCreate(this.resource, result);
  }

  @Get(':id')
  async get(@Param() { id }: MongoIdPipe) {
    const result = await this.service.findOrFail({ _id: id }, undefined, undefined, {
      path: 'checkLists',
      select: 'content',
    });
    return responseDetail(this.resource, result);
  }

  @Put(':id')
  @Roles(EUserRole.ADMIN, EUserRole.EDITOR)
  async update(@Param() { id }: MongoIdPipe, @Body() data: UpdateTermDto, @Req() req: IRequest) {
    const found = await this.service.getById(id);
    if (data.checkLists) {
      await this.service.checkListExists(data.checkLists);
    }
    if (data.source) {
      await this.sourceService.getById(data.source);
    }
    const result = await this.service.update(found, data, ['title']);
    const auditData = generateAuditData(req, EResourceAction.UPDATE, this.resource, result, found);
    this.auditService.auditTrail(auditData);
    return responseUpdate(this.resource, result);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN)
  async destroy(@Param() { id }: MongoIdPipe, @Req() req: IRequest) {
    const found = await this.service.getById(id);
    await this.service.delete(found);
    const auditData = generateAuditData(req, EResourceAction.DELETE, this.resource, {}, found);
    this.auditService.auditTrail(auditData);
    return responseDelete(this.resource);
  }
}
