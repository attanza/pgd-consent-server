import { Controller, Get, UseGuards } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ConsentService } from './consent/consent.service';
import { Roles } from './shared/guards/roles.decorator';
import { RolesGuard } from './shared/guards/roles.guard';
import { EUserRole } from './shared/interfaces/user-role.enum';
import { responseSuccess } from './utils/response-parser';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly consentService: ConsentService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(RolesGuard)
  @Roles(EUserRole.ADMIN)
  @Get('seed')
  async seed() {
    await this.appService.seed();
    return responseSuccess('Data seeded', undefined);
  }

  @EventPattern('consent_add_attachment')
  handleOrderCreated(data: any) {
    this.consentService.handleAttachment(data.value);
  }
}
