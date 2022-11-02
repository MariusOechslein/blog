import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../user/service/user.service';
import { Observable } from 'rxjs';
import { User } from '../../user/models/user.interface';
import { map } from 'rxjs/operators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userJwt: User = request.user.user;
    return this.userService.findOne(userJwt.id).pipe(
      map((user: User) => {
        // userJwt.id == user.id, wegen nestjs bug, dass automatisch erster User returned wird, falls keiner gefunden wurde
        return user && userJwt.id == user.id && roles.indexOf(user.role) > -1;
      }),
    );
  }
}
