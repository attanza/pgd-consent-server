import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckListModule } from 'src/check-list/check-list.module';

import { TermController } from './term.controller';
import { Term, TermSchema } from './term.schema';
import { TermService } from './term.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Term.name, schema: TermSchema }]), CheckListModule],
  controllers: [TermController],
  providers: [TermService],
  exports: [TermService],
})
export class TermModule {}
