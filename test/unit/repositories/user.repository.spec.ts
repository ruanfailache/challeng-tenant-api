import { getMockedPrismaService } from '@mocks/lib/prisma.mock'
import { getMockedMappedUser } from '@mocks/user/create-user.mock'
import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { UserMapper } from '@/domain/mappers/user.mapper'
import { UserRepository } from '@/infrastructure/adapters/out/database/repositories/user.repository'
import { PrismaService } from '@/infrastructure/adapters/out/database/services/prisma.service'

jest.mock(
  '@/infrastructure/adapters/out/database/services/prisma.service',
  () => getMockedPrismaService(),
)

describe('UserRepository', () => {
  let sut: UserRepository

  let mockedPrismaService: PrismaService
  let mockedUserMapper: UserMapper

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [UserRepository, PrismaService, UserMapper],
    }).compile()

    sut = moduleRef.get<UserRepository>(UserRepository)

    mockedPrismaService = moduleRef.get<PrismaService>(PrismaService)
    mockedUserMapper = moduleRef.get<UserMapper>(UserMapper)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
    expect(mockedPrismaService).toBeDefined()
    expect(mockedUserMapper).toBeDefined()
  })

  describe('save', () => {
    it('should save a user and return the mapped domain model', async () => {
      const user = getMockedMappedUser()

      jest.spyOn(mockedUserMapper, 'fromEntityToDomain').mockReturnValue(user)

      jest.spyOn(mockedPrismaService.user, 'create').mockResolvedValue({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })

      const result = await sut.save(user)

      expect(result).toBeDefined()
      expect(mockedPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
        },
      })
      expect(result).toBe(user)
    })
  })
})
