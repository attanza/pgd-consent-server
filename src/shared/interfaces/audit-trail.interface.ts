export enum EAuditTrailAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'READ',
}

export enum EAuditTrailResource {
  CONSENTS = 'consents',
  USERS = 'users',
  CHECK_LISTS = 'check-lists',
  TERMS = 'terms',
}
