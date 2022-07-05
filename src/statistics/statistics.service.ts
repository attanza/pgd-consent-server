import { Injectable } from '@nestjs/common';
import { ConsentService } from 'src/consent/consent.service';
import { SourcesService } from 'src/sources/sources.service';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly consentService: ConsentService,
    private readonly sourceService: SourcesService,
  ) {}

  async getStatistic() {
    const countOfSources = [];
    const sortByCount = await this.consentService.sortByCount('source');
    const sourceIds = sortByCount.map((s: any) => s._id);
    const sources = await this.sourceService.findInIds(sourceIds, 'name');
    sortByCount.map((c) => {
      const idx = sources.findIndex((s) => s._id.toString() === c._id.toString());
      if (idx !== -1) {
        countOfSources.push({
          source: sources[idx].name,
          count: c.count,
        });
      }
    });
    return { countOfSources };
  }
}

// data [
//   { _id: '62c12e6da397fa98ebf0388f', count: 26 },
//   { _id: '62c12e6da397fa98ebf0388e', count: 23 },
//   { _id: '62c12e6da397fa98ebf03892', count: 20 },
//   { _id: '62c12e6da397fa98ebf03891', count: 18 },
//   { _id: '62c12e6da397fa98ebf03890', count: 13 }
// ]
