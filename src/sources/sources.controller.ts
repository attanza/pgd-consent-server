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
import { AuditTrailsService } from '../audit-trails/audit-trails.service';
import { Roles } from '../shared/guards/roles.decorator';
import { IRequest } from '../shared/interfaces/request.interface';
import { EResourceAction } from '../shared/interfaces/resource-action';
import { EUserRole } from '../shared/interfaces/user-role.enum';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { generateAuditData } from '../utils/generate-audit-data';
import {
  responseCollection,
  responseCreate,
  responseDelete,
  responseDetail,
  responseUpdate,
} from '../utils/response-parser';
import { CreateSourceDto, UpdateSourceDto } from './source.dto';
import { SourcesService } from './sources.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sources')
export class SourcesController {
  private resource = 'Source';
  constructor(
    private readonly service: SourcesService,
    private readonly auditService: AuditTrailsService,
  ) {}

  @Get()
  async paginate(@Query() query: ResourcePaginationPipe) {
    const result = await this.service.paginate(query, ['name', 'ipAddresses']);
    return responseCollection(this.resource, result);
  }

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.EDITOR)
  async create(@Body() data: CreateSourceDto, @Req() req: IRequest) {
    const { clientId, clientSecret } = this.service.generateSecret();
    const postData: any = { ...data, clientId, clientSecret };
    const result = await this.service.create(postData, ['name']);
    const auditData = generateAuditData(req, EResourceAction.CREATE, this.resource, result);
    this.auditService.auditTrail(auditData);
    return responseCreate(this.resource, result);
  }

  @Get(':id')
  async get(@Param() { id }: MongoIdPipe) {
    const result = await this.service.findOrFail({ _id: id });
    return responseDetail(this.resource, result);
  }

  @Put(':id')
  @Roles(EUserRole.ADMIN, EUserRole.EDITOR)
  async update(@Param() { id }: MongoIdPipe, @Body() data: UpdateSourceDto, @Req() req: IRequest) {
    const found = await this.service.getById(id);

    const result = await this.service.update(found, data, ['name']);
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
