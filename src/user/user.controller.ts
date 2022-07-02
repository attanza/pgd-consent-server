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
import { RolesGuard } from '../shared/guards/roles.guard';
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
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
  private resource = 'User';
  constructor(
    private readonly service: UserService,
    private readonly auditService: AuditTrailsService,
  ) {}

  @Get()
  @Roles(EUserRole.ADMIN)
  async paginate(@Query() query: ResourcePaginationPipe) {
    query.select = '-password';
    const result = await this.service.paginate(query);
    return responseCollection(this.resource, result);
  }

  @Post()
  @Roles(EUserRole.ADMIN)
  async create(@Body() data: CreateUserDto, @Req() req: IRequest) {
    const result = await this.service.create(data, ['email']);
    const auditData = generateAuditData(req, EResourceAction.CREATE, this.resource, result);
    this.auditService.auditTrail(auditData);
    return responseCreate(this.resource, result);
  }

  @Get(':id')
  @Roles(EUserRole.ADMIN)
  async get(@Param() { id }: MongoIdPipe) {
    const result = await this.service.findOrFail({ _id: id });
    return responseDetail(this.resource, result);
  }

  @Put(':id')
  @Roles(EUserRole.ADMIN)
  async update(@Param() { id }: MongoIdPipe, @Body() data: UpdateUserDto, @Req() req: IRequest) {
    const found = await this.service.getById(id);
    const result = await this.service.update(found, data, ['email']);
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
