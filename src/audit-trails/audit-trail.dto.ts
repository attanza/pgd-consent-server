export class AuditTrailDto {
  ip: string;
  userId: string;
  email: string;
  action: string;
  resource: string;
  resourceId: string;
  prevData: string;
  data: string;
}
