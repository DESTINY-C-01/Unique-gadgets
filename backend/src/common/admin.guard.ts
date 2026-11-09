import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

/** Protects admin routes: send the secret in the "x-admin-key" header. */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private cfg: ConfigService) {}
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const want = Buffer.from(this.cfg.get<string>('ADMIN_KEY') || '');
    const given = Buffer.from(String(req.headers['x-admin-key'] ?? ''));
    if (!want.length || want.length !== given.length || !timingSafeEqual(want, given)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
