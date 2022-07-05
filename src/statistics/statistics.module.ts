import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { ConsentModule } from 'src/consent/consent.module';
import { SourcesModule } from 'src/sources/sources.module';

@Module({
  imports: [ConsentModule, SourcesModule],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
