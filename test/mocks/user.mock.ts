import { User } from '@/domain/models/user'
import { CreateUserRequest } from '@/infrastructure/adapters/in/rest/dto/requests/user/create-user.request'

export function getMockedCreateUserRequest(): CreateUserRequest {
  return {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    password: 'anothersecurepassword',
  }
}

export function getMockedHashedPassword(): string {
  return 'hashed_anothersecurepassword'
}

export function getMockedMappedUser(): User {
  const mockedRequest = getMockedCreateUserRequest()

  const user = new User()
  user.id = 'user-id-123'
  user.name = mockedRequest.name
  user.email = mockedRequest.email
  user.password = mockedRequest.password
  user.createdAt = new Date()
  user.updatedAt = new Date()
  return user
}

export function getMockedExpectedUser(): User {
  const mappedUser = getMockedMappedUser()
  mappedUser.password = getMockedHashedPassword()
  return mappedUser
}
