import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { User } from '../user/user.entity'
import { UserRole } from '../user/types'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user: User = context.switchToHttp().getRequest().user

    return user.role === UserRole.Admin
  }
}