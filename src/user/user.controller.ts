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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MongoIdPipe } from 'src/shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from 'src/shared/pipes/resource-pagination.pipe';
import {
  responseCollection,
  responseCreate,
  responseDelete,
  responseDetail,
  responseUpdate,
} from 'src/utils/response-parser';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  private resource = 'User';
  constructor(private readonly service: UserService) {}

  @Get()
  async paginate(@Query() query: ResourcePaginationPipe) {
    query.select = '-password';
    const result = await this.service.paginate(query);
    return responseCollection(this.resource, result);
  }

  @Post()
  async create(@Body() data: CreateUserDto) {
    const result = await this.service.create(data, ['email']);
    return responseCreate(this.resource, result);
  }

  @Get(':id')
  async get(@Param() { id }: MongoIdPipe) {
    const result = await this.service.findOrFail({ _id: id });
    return responseDetail(this.resource, result);
  }

  @Put(':id')
  async update(@Param() { id }: MongoIdPipe, @Body() data: UpdateUserDto) {
    const result = await this.service.update(id, data, ['email']);
    return responseUpdate(this.resource, result);
  }

  @Delete(':id')
  async destroy(@Param() { id }: MongoIdPipe) {
    await this.service.delete(id);
    return responseDelete(this.resource);
  }
}
