import { Injectable } from '@nestjs/common'
import { UserMapper } from '@/domain/mappers/user.mapper'
import { User } from '@/domain/models/user'
import { CreateUserRequest } from '@/infrastructure/adapters/in/rest/dto/requests/create-user.request'
import { UserRepository } from '@/infrastructure/adapters/out/database/repositories/user.repository'
import { CryptorUtil } from '@/utils/cryptor.util'

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly cryptorUtil: CryptorUtil,
    private readonly userMapper: UserMapper,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(user: CreateUserRequest): Promise<User> {
    const hashedPassword = await this.cryptorUtil.hashPassword(user.password)
    const mappedUser = this.userMapper.fromCreateRequestToDomain({
      ...user,
      password: hashedPassword,
    })
    return this.userRepository.save(mappedUser)
  }
}
