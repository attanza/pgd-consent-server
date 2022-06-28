import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CheckListController } from './check-list.controller';
import { CheckList, CheckListSchema } from './check-list.schema';
import { CheckListService } from './check-list.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckList.name, schema: CheckListSchema },
    ]),
  ],
  providers: [CheckListService],
  exports: [CheckListService],
  controllers: [CheckListController],
})
export class CheckListModule {}
