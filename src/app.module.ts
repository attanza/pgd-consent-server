import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CheckListModule } from './check-list/check-list.module';
import { ConsentModule } from './consent/consent.module';
import { DatabaseModule } from './database/database.module';
import { TermModule } from './term/term.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, CheckListModule, TermModule, ConsentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
