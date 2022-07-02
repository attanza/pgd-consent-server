import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';

import { APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
import type { ClientOpts } from 'redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditTrailsModule } from './audit-trails/audit-trails.module';
import { CheckListModule } from './check-list/check-list.module';
import { ConsentModule } from './consent/consent.module';
import { DatabaseModule } from './database/database.module';
import { SourcesModule } from './sources/sources.module';
import { TermModule } from './term/term.module';
import { UserModule } from './user/user.module';
@Module({
  imports: [
    DatabaseModule,
    UserModule,
    CheckListModule,
    TermModule,
    ConsentModule,
    AuditTrailsModule,
    SourcesModule,
    CacheModule.register<ClientOpts>({
      isGlobal: true,
      store: redisStore,

      host: process.env.REDIS_URL,
      port: 6379,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
