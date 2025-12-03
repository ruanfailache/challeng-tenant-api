import { Injectable, UnauthorizedException } from '@nestjs/common'
import { LoginRequest } from '@/infrastructure/adapters/in/rest/dto/requests/auth/login.request'
import { AuthResponse } from '@/infrastructure/adapters/in/rest/dto/responses/auth/auth.response'
import { UserRepository } from '@/infrastructure/adapters/out/database/repositories/user.repository'
import { CryptorService } from '@/infrastructure/security/services/cryptor.service'
import { SecurityService } from '@/infrastructure/security/services/security.service'

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptorUtil: CryptorService,
    private readonly securityService: SecurityService,
  ) {}

  async execute(request: LoginRequest): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(request.email)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await this.cryptorUtil.comparePassword(request.password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const accessToken = await this.securityService.generateToken(user)

    return new AuthResponse(accessToken)
  }
}
