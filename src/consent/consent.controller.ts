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
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AuditTrailsService } from '../audit-trails/audit-trails.service';
import { IRequest } from '../shared/interfaces/request.interface';
import { EResourceAction } from '../shared/interfaces/resource-action';
import { generateAuditData } from '../utils/generate-audit-data';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../shared/guards/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guard';
import { EUserRole } from '../shared/interfaces/user-role.enum';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import {
  responseCollection,
  responseCreate,
  responseDelete,
  responseDetail,
  responseUpdate,
} from '../utils/response-parser';
import { CreateConsentDto, UpdateConsentDto } from './consent.dto';
import { ConsentService } from './consent.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('consents')
export class ConsentController {
  private resource = 'Consent';
  constructor(
    private readonly service: ConsentService,
    private readonly auditService: AuditTrailsService,
  ) {}

  @Get()
  async paginate(@Query() query: ResourcePaginationPipe) {
    const result = await this.service.paginate(query, [
      'source',
      'nik',
      'name',
      'email',
      'phone',
      'cif',
    ]);
    return responseCollection(this.resource, result);
  }

  @Post()
  async create(@Body() data: CreateConsentDto, @Req() req: IRequest) {
    if (!data.email && !data.nik && !data.phone) {
      throw new UnprocessableEntityException(
        'one of fields [nik, phone, email, cif] should exists',
      );
    }

    const result = await this.service.createOrUpdate(data, req);
    const auditData = generateAuditData(req, EResourceAction.CREATE, this.resource, result);
    this.auditService.auditTrail(auditData);
    return responseCreate(this.resource, result);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.service.getConsent(id);
    return responseDetail(this.resource, result);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateConsentDto, @Req() req: IRequest) {
    const found = await this.service.getConsent(id);
    const result = await this.service.createOrUpdate(data, req);
    const auditData = generateAuditData(req, EResourceAction.UPDATE, this.resource, result, found);
    this.auditService.auditTrail(auditData);
    return responseUpdate(this.resource, result);
  }

  @Delete(':id')
  // @Roles(EUserRole.ADMIN)
  async destroy(@Param() { id }: MongoIdPipe, @Req() req: IRequest) {
    const found = await this.service.getConsent(id);
    await this.service.delete(found);
    const auditData = generateAuditData(req, EResourceAction.DELETE, this.resource, {}, found);
    this.auditService.auditTrail(auditData);
    return responseDelete(this.resource);
  }
}
