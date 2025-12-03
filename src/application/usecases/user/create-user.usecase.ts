import { Injectable, NotFoundException } from '@nestjs/common'
import { UserMapper } from '@/domain/mappers/user.mapper'
import { User } from '@/domain/models/user'
import { CreateUserRequest } from '@/infrastructure/adapters/in/rest/dto/requests/user/create-user.request'
import { UserRepository } from '@/infrastructure/adapters/out/database/repositories/user.repository'
import { CryptorService } from '@/infrastructure/security/services/cryptor.service'

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly cryptorService: CryptorService,
    private readonly userMapper: UserMapper,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(user: CreateUserRequest): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(user.email)

    if (existingUser) {
      throw new NotFoundException('User already exists')
    }

    const hashedPassword = await this.cryptorService.hashPassword(user.password)

    const mappedUser = this.userMapper.fromCreateRequestToDomain({
      ...user,
      password: hashedPassword,
    })

    return this.userRepository.save(mappedUser)
  }
}
