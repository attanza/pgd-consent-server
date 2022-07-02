import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../user/user.schema';
import { Redis } from '../../utils/redis';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-auth-id'];

    const user = await Redis.get<User>(`Authorized_${userId}`);
    if (!user) {
      return false;
    }
    request.user = user;
    return roles.includes(user.role);
  }
}
