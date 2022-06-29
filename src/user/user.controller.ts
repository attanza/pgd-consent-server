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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../shared/guards/roles.decorator';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import {
  responseCollection,
  responseCreate,
  responseDelete,
  responseDetail,
  responseUpdate,
} from '../utils/response-parser';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';
import { EUserRole } from '../shared/interfaces/user-role.enum';
import { RolesGuard } from '../shared/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  private resource = 'User';
  constructor(private readonly service: UserService) {}

  @Get()
  @Roles(EUserRole.ADMIN)
  async paginate(@Query() query: ResourcePaginationPipe) {
    query.select = '-password';
    const result = await this.service.paginate(query);
    return responseCollection(this.resource, result);
  }

  @Post()
  @Roles(EUserRole.ADMIN)
  async create(@Body() data: CreateUserDto) {
    const result = await this.service.create(data, ['email']);
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
  async update(@Param() { id }: MongoIdPipe, @Body() data: UpdateUserDto) {
    const result = await this.service.update(id, data, ['email']);
    return responseUpdate(this.resource, result);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN)
  async destroy(@Param() { id }: MongoIdPipe) {
    await this.service.delete(id);
    return responseDelete(this.resource);
  }
}
