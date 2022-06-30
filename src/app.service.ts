import { Injectable } from '@nestjs/common';
import { EUserRole } from './shared/interfaces/user-role.enum';
import { CreateUserDto } from './user/user.dto';
import { UserService } from './user/user.service';
import { capitalCase, snakeCase } from 'change-case';
import { hash } from 'argon2';
@Injectable()
export class AppService {
  constructor(private readonly userService: UserService) {}
  getHello(): string {
    return 'Hello World!';
  }

  async seed() {
    const userData: CreateUserDto[] = [];
    const password = await hash('password');
    Object.values(EUserRole).map((role: EUserRole) => {
      userData.push({
        name: capitalCase(role),
        email: `${snakeCase(role)}@gmail.com`,
        password,
        role,
      });
    });
    await this.userService.insertMany(userData);
  }
}
