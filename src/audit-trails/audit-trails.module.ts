import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuditTrailsService } from './audit-trails.service';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUDIT_TRAIL_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'audit-trail',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'audit-trail-consumer',
          },
        },
      },
    ]),
  ],
  providers: [AuditTrailsService],
  exports: [AuditTrailsService],
})
export class AuditTrailsModule {}
