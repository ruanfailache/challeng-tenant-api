import { Injectable, NotFoundException } from '@nestjs/common'
import { UserMapper } from '@/domain/mappers/user.mapper'
import { User } from '@/domain/models/user'
import { CreateUserRequest } from '@/infrastructure/adapters/in/rest/dto/requests/user/create-user.request'
import { UserRepository } from '@/infrastructure/adapters/out/database/repositories/user.repository'
import { CryptorUtil } from '@/infrastructure/security/utils/cryptor.util'

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly cryptorUtil: CryptorUtil,
    private readonly userMapper: UserMapper,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(user: CreateUserRequest): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(user.email)

    if (existingUser) {
      throw new NotFoundException('User already exists')
    }

    const hashedPassword = await this.cryptorUtil.hashPassword(user.password)

    const mappedUser = this.userMapper.fromCreateRequestToDomain({
      ...user,
      password: hashedPassword,
    })

    return this.userRepository.save(mappedUser)
  }
}
