import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from 'src/shared/guards/roles.decorator';
import { EUserRole } from 'src/shared/interfaces/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('check-lists')
export class CheckListController {
  private resource = 'CheckList';
  constructor(private readonly service: CheckListService) {}

  @Get()
  async paginate(@Query() query: ResourcePaginationPipe) {
    const result = await this.service.paginate(query, ['content']);
    return responseCollection(this.resource, result);
  }

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.EDITOR)
  async create(@Body() data: CreateCheckListDto) {
    const result = await this.service.create(data, ['content']);
    return responseCreate(this.resource, result);
  }

  @Get(':id')
  async get(@Param() { id }: MongoIdPipe) {
    const result = await this.service.getById(id);
    return responseDetail(this.resource, result);
  }

  @Put(':id')
  @Roles(EUserRole.ADMIN, EUserRole.EDITOR)
  async update(@Param() { id }: MongoIdPipe, @Body() data: UpdateCheckListDto) {
    const result = await this.service.update(id, data, ['content']);
    return responseUpdate(this.resource, result);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN)
  async destroy(@Param() { id }: MongoIdPipe) {
    await this.service.delete(id);
    return responseDelete(this.resource);
  }
}
