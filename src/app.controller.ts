import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Roles } from './shared/guards/roles.decorator';
import { RolesGuard } from './shared/guards/roles.guard';
import { EUserRole } from './shared/interfaces/user-role.enum';
import { responseSuccess } from './utils/response-parser';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(EUserRole.ADMIN)
  @Get('seed')
  async seed() {
    await this.appService.seed();
    return responseSuccess('Data seeded', undefined);
  }
}
