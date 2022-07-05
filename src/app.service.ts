import { Injectable } from '@nestjs/common';
import { EUserRole } from './shared/interfaces/user-role.enum';
import { CreateUserDto } from './user/user.dto';
import { UserService } from './user/user.service';
import { capitalCase, snakeCase } from 'change-case';
import { hash } from 'argon2';
import { SourcesService } from './sources/sources.service';
import { CreateSourceDto } from './sources/source.dto';
@Injectable()
export class AppService {
  constructor(
    private readonly userService: UserService,
    private readonly sourceService: SourcesService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async seed() {
    // Users
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
    // Sources
    const sources = ['PDS', 'PSDS', 'PASSION SYARIAH', 'PASSION KONVEN', 'DIGILAND'];
    const sourceData = [];
    sources.forEach((s) => {
      const { clientId, clientSecret } = this.sourceService.generateSecret();
      sourceData.push({
        name: s,
        clientId,
        clientSecret,
      });
    });
    await Promise.all([
      this.userService.insertMany(userData),
      this.sourceService.insertMany(sourceData),
    ]);
  }
}
