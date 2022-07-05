import { Controller, Get } from '@nestjs/common';
import { responseDetail } from 'src/utils/response-parser';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  private resource = 'Statistics';

  constructor(private readonly service: StatisticsService) {}

  @Get()
  async getStatistics() {
    const statistics = await this.service.getStatistic();
    return responseDetail(this.resource, statistics);
  }
}
