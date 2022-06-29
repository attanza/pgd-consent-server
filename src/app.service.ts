import { Injectable } from '@nestjs/common';
import { EUserRole } from './shared/interfaces/user-role.enum';
import { CreateUserDto } from './user/user.dto';
import { UserService } from './user/user.service';
import { capitalCase, snakeCase } from 'change-case';
@Injectable()
export class AppService {
  constructor(private readonly userService: UserService) {}
  getHello(): string {
    return 'Hello World!';
  }

  async seed() {
    const userData: CreateUserDto[] = [];
    Object.values(EUserRole).map((role: EUserRole) => {
      userData.push({
        name: capitalCase(role),
        email: `${snakeCase(role)}@pegadaian.co.id`,
        password:
          '$argon2i$v=19$m=4096,t=3,p=1$BKuM18FRgCGLNJdPItwvpA$HoeEO7wnFeyKt66RyYLsscbpScmxzDKKH88jWvw9aWg',
        role,
      });
    });
    await this.userService.insertMany(userData);
  }
}
