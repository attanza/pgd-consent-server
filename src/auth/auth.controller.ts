import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { responseDetail, responseSuccess } from 'src/utils/response-parser';
import { RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(@Req() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req) {
    return responseDetail('Me', req.user);
  }

  @Post('register')
  @HttpCode(200)
  async register(@Body() data: RegisterDto) {
    await this.authService.register(data);
    return responseSuccess('Register Suceed', undefined);
  }
}
