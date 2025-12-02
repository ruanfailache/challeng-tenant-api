import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@/domain/models/user'
import { LoggedUserPayload } from '../dto/payloads/logged-user.payload'

@Injectable()
export class SecurityService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(user: User): Promise<string> {
    const payload: LoggedUserPayload = {
      userId: user.id,
    }
    return this.jwtService.signAsync(payload)
  }

  verifyToken(token: string): Promise<LoggedUserPayload> {
    return this.jwtService.verifyAsync<LoggedUserPayload>(token)
  }
}
