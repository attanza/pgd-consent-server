import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EUserRole } from '../interfaces/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const _id = request.headers['x-auth-id'];
    const email = request.headers['x-auth-email'];
    const role = request.headers['x-auth-role'];
    if (!_id && !email && !role) {
      return false;
    }
    const user = { _id, email, role };
    request.user = user;
    console.log('user', user);

    if (roles.includes(EUserRole.ALL)) {
      return true;
    }
    return roles.includes(user.role);
  }
}
