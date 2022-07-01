import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { AuditTrailEvent } from '../events/audit-trail.event';
import { AuditTrailDto } from './audit-trail.dto';

@Injectable()
export class AuditTrailsService {
  constructor(@Inject('AUDIT_TRAIL_SERVICE') private readonly auditTrailCLient: ClientKafka) {}

  async auditTrail(auditData: AuditTrailDto) {
    const { userId, ip, email, action, resource, resourceId, prevData, data } = auditData;
    this.auditTrailCLient.emit(
      'audit_trail',
      new AuditTrailEvent(userId, ip, email, action, resource, resourceId, prevData, data),
    );
  }
}
