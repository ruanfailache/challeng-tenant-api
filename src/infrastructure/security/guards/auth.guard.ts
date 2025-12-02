import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { AuthenticatedRequest } from '../dto/requests/authenticated.request'
import { SecurityService } from '../services/security.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly securityService: SecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const [_, token] = request.headers.get('authorization')?.split(' ') ?? []

    if (!token) {
      throw new UnauthorizedException('No Authorization token provided')
    }

    try {
      const payload = await this.securityService.verifyToken(token)
      request.user = payload
    } catch (_) {
      throw new UnauthorizedException('Invalid Authorization token')
    }

    return true
  }
}
