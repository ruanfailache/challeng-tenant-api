import { Test } from '@nestjs/testing'
import { UserMapper } from '@/domain/mappers/user.mapper'
import { CreateUserRequest } from '@/infrastructure/adapters/in/rest/dto/requests/create-user.request'

describe('UserMapper', () => {
  let sut: UserMapper

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UserMapper],
    }).compile()

    sut = moduleRef.get<UserMapper>(UserMapper)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('fromCreateRequestToDomain', () => {
    it('should map CreateUserRequest to User domain model', () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'securepassword',
      }

      const result = sut.fromCreateRequestToDomain(request)

      expect(result).toBeDefined()
      expect(result.name).toBe(request.name)
      expect(result.email).toBe(request.email)
      expect(result.password).toBe(request.password)
    })
  })

  describe('fromDomainToEntity', () => {
    it('should map User domain model to PrismaUser entity', () => {
      const user = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'securepassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = sut.fromEntityToDomain(user)

      expect(result).toBeDefined()
      expect(result.id).toBe(user.id)
      expect(result.name).toBe(user.name)
      expect(result.email).toBe(user.email)
      expect(result.password).toBe(user.password)
      expect(result.createdAt).toBe(user.createdAt)
      expect(result.updatedAt).toBe(user.updatedAt)
    })
  })
})
