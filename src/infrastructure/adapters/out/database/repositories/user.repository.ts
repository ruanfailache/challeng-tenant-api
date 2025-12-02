import { Injectable } from '@nestjs/common'
import { UserMapper } from '@/domain/mappers/user.mapper'
import { User } from '@/domain/models/user'
import { User as PrismaUser } from '@/generated/prisma/client'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userMapper: UserMapper,
  ) {}

  async save(user: User): Promise<User> {
    const createdUser: PrismaUser = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    })
    return this.userMapper.fromEntityToDomain(createdUser)
  }

  async findByEmail(email: string): Promise<User | null> {
    const foundUser: PrismaUser | null = await this.prisma.user.findUnique({
      where: { email },
    })
    if (!foundUser) {
      return null
    }
    return this.userMapper.fromEntityToDomain(foundUser)
  }
}
