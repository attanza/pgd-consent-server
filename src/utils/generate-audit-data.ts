import { AuditTrailDto } from '../audit-trails/audit-trail.dto';
import { IRequest } from '../shared/interfaces/request.interface';
import { EResourceAction } from '../shared/interfaces/resource-action';

export const generateAuditData = (
  req: IRequest,
  action: EResourceAction,
  resource: string,
  newData: any,
  oldData?: any,
): AuditTrailDto => ({
  ip: req.ip,
  userId: req.user._id,
  email: req.user.email,
  action,
  resource,
  resourceId: newData._id,
  prevData: oldData ? JSON.stringify(oldData) : '',
  data: JSON.stringify(newData),
});
