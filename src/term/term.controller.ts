import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
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
import { CreateTermDto, UpdateTermDto } from './term.dto';
import { TermService } from './term.service';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/guards/roles.decorator';
import { EUserRole } from 'src/shared/interfaces/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('terms')
export class TermController {
  private resource = 'Term';
  constructor(private readonly service: TermService) {}

  @Get()
  async paginate(@Query() query: ResourcePaginationPipe) {
    const result = await this.service.paginate(query, ['title', 'source']);
    return responseCollection(this.resource, result);
  }

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.EDITOR)
  async create(@Body() data: CreateTermDto) {
    if (data.checkLists) {
      await this.service.checkListExists(data.checkLists);
    }
    const result = await this.service.create(data, ['title']);
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
  async update(@Param() { id }: MongoIdPipe, @Body() data: UpdateTermDto) {
    if (data.checkLists) {
      await this.service.checkListExists(data.checkLists);
    }
    const result = await this.service.update(id, data, ['title']);
    return responseUpdate(this.resource, result);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN)
  async destroy(@Param() { id }: MongoIdPipe) {
    await this.service.delete(id);
    return responseDelete(this.resource);
  }
}
