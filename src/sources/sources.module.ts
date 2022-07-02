import { Module } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { SourcesController } from './sources.controller';
import { Source, SourceSchema } from './source.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Source.name, schema: SourceSchema }])],
  providers: [SourcesService],
  controllers: [SourcesController],
})
export class SourcesModule {}
