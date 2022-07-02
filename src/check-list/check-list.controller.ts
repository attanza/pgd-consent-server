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

import { EResourceAction } from 'src/shared/interfaces/resource-action';
import { generateAuditData } from 'src/utils/generate-audit-data';
import { AuditTrailsService } from '../audit-trails/audit-trails.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../shared/guards/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guard';
import { IRequest } from '../shared/interfaces/request.interface';
import { EUserRole } from '../shared/interfaces/user-role.enum';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import {
  responseCollection,
  responseCreate,
  responseDelete,
  responseDetail,
  responseUpdate,
} from '../utils/response-parser';
import { CreateCheckListDto, UpdateCheckListDto } from './check-list.dto';
import { CheckListService } from './check-list.service';
import { SourcesService } from 'src/sources/sources.service';

@UseGuards(RolesGuard)
@Controller('check-lists')
export class CheckListController {
  private resource = 'CheckList';
  constructor(
    private readonly service: CheckListService,
    private readonly auditService: AuditTrailsService,
    private readonly sourceService: SourcesService,
  ) {}

  @Get()
  async paginate(@Query() query: ResourcePaginationPipe) {
    const result = await this.service.paginate(query, ['content']);
    return responseCollection(this.resource, result);
  }

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.EDITOR)
  async create(@Body() data: CreateCheckListDto, @Req() req: IRequest) {
    if (data.source) {
      await this.sourceService.getById(data.source);
    }
    const result = await this.service.create(data, ['content']);
    const auditData = generateAuditData(req, EResourceAction.CREATE, this.resource, result);
    this.auditService.auditTrail(auditData);
    return responseCreate(this.resource, result);
  }

  @Get(':id')
  async get(@Param() { id }: MongoIdPipe) {
    const result = await this.service.getById(id);
    return responseDetail(this.resource, result);
  }

  @Put(':id')
  @Roles(EUserRole.ADMIN, EUserRole.EDITOR)
  async update(
    @Param() { id }: MongoIdPipe,
    @Body() data: UpdateCheckListDto,
    @Req() req: IRequest,
  ) {
    if (data.source) {
      await this.sourceService.getById(data.source);
    }
    const found = await this.service.getById(id);
    const result = await this.service.update(found, data, ['content']);
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
