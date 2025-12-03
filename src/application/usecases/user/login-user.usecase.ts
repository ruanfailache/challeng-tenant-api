import { Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from '@/domain/models/user'
import { LoginRequest } from '@/infrastructure/adapters/in/rest/dto/requests/auth/login.request'
import { UserRepository } from '@/infrastructure/adapters/out/database/repositories/user.repository'
import { CryptorService } from '@/infrastructure/security/services/cryptor.service'

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptorService: CryptorService,
  ) {}

  async execute(request: LoginRequest): Promise<User> {
    const user = await this.userRepository.findByEmail(request.email)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await this.cryptorService.comparePassword(request.password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return user
  }
}
