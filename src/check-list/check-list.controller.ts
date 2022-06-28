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

@UseGuards(JwtAuthGuard)
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
  async update(@Param() { id }: MongoIdPipe, @Body() data: UpdateCheckListDto) {
    const result = await this.service.update(id, data, ['content']);
    return responseUpdate(this.resource, result);
  }

  @Delete(':id')
  async destroy(@Param() { id }: MongoIdPipe) {
    await this.service.delete(id);
    return responseDelete(this.resource);
  }
}
