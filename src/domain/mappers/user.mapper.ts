import { Injectable } from '@nestjs/common'
import { User as PrismaUser } from '@/generated/prisma/client'
import { CreateUserRequest } from '@/infrastructure/adapters/in/rest/dto/requests/create-user.request'
import { User } from '../models/user'

@Injectable()
export class UserMapper {
  fromCreateRequestToDomain(request: CreateUserRequest): User {
    const user = new User()
    user.name = request.name
    user.email = request.email
    user.password = request.password
    return user
  }

  fromEntityToDomain(entity: PrismaUser): User {
    const user = new User()
    user.id = entity.id
    user.name = entity.name
    user.email = entity.email
    user.password = entity.password
    user.createdAt = entity.createdAt
    user.updatedAt = entity.updatedAt
    return user
  }
}
