import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CheckListModule } from './check-list/check-list.module';
import { ConsentModule } from './consent/consent.module';
import { DatabaseModule } from './database/database.module';
import { TermModule } from './term/term.module';
import { UserModule } from './user/user.module';
import { AuditTrailsModule } from './audit-trails/audit-trails.module';
import { SourcesModule } from './sources/sources.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
import type { ClientOpts } from 'redis';
@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
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
