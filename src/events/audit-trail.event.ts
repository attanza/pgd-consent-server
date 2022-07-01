export class AuditTrailEvent {
  constructor(
    public readonly userId: string,
    public readonly ip: string,
    public readonly email: string,
    public readonly action: string,
    public readonly resource: string,
    public readonly resourceId: string,
    public readonly prevData: string,
    public readonly data: string,
  ) {}

  toString() {
    return JSON.stringify({
      ip: this.ip,
      userId: this.userId,
      email: this.email,
      action: this.action,
      resource: this.resource,
      resourceId: this.resourceId,
      prevData: this.prevData,
      data: this.data,
    });
  }
}
