import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { LoggedUserPayload } from '../dto/payloads/logged-user.payload'
import { AuthenticatedRequest } from '../dto/requests/authenticated.request'

export const CurrentUser = createParamDecorator(
  (ctx: ExecutionContext): LoggedUserPayload | unknown | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    return request.user
  },
)
