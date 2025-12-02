import { LoggedUserPayload } from '../payloads/logged-user.payload'

export interface AuthenticatedRequest extends Request {
  user?: LoggedUserPayload
}
