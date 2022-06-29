import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
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
import { CreateConsentDto, UpdateConsentDto } from './consent.dto';
import { ConsentService } from './consent.service';

@UseGuards(JwtAuthGuard)
@Controller('consents')
export class ConsentController {
  private resource = 'Consent';
  constructor(private readonly service: ConsentService) {}

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
  async create(@Body() data: CreateConsentDto) {
    if (!data.email && !data.nik && !data.phone) {
      throw new UnprocessableEntityException(
        'one of fields [nik, phone, email, cif] should exists.',
      );
    }

    const result = await this.service.createOrUpdate(data);
    return responseCreate(this.resource, result);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.service.getConsent(id);
    return responseDetail(this.resource, result);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateConsentDto) {
    const result = await this.service.createOrUpdate(data);

    return responseUpdate(this.resource, result);
  }

  @Delete(':id')
  async destroy(@Param() { id }: MongoIdPipe) {
    await this.service.delete(id);
    return responseDelete(this.resource);
  }

  // @Post(':id/add-attachment')
  // @HttpCode(200)
  // @UseInterceptors(FileInterceptor('file'))
  // async addAttachment(@Param('id') id: string, @UploadedFile() file: BufferedFile) {
  //   if (!file) {
  //     throw new BadRequestException('file is required');
  //   }
  //   const result = await this.service.addAttachment(id, file);
  //   return responseSuccess('File received and will be process', result);
  // }
}
