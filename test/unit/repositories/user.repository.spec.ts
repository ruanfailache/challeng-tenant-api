import { getMockedMappedUser } from '@mocks/user.mock'
import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { UserMapper } from '@/domain/mappers/user.mapper'
import { UserRepository } from '@/infrastructure/adapters/out/database/repositories/user.repository'
import { PrismaService } from '@/infrastructure/adapters/out/database/services/prisma.service'

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

  describe('findByEmail', () => {
    it('should find a user by email and return the mapped domain model', async () => {
      const user = getMockedMappedUser()

      jest.spyOn(mockedUserMapper, 'fromEntityToDomain').mockReturnValue(user)

      jest.spyOn(mockedPrismaService.user, 'findUnique').mockResolvedValue({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })

      const result = await sut.findByEmail(user.email)

      expect(result).toBeDefined()
      expect(mockedPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: user.email },
      })
      expect(result).toBe(user)
    })

    it('should return null if no user is found', async () => {
      jest.spyOn(mockedPrismaService.user, 'findUnique').mockResolvedValue(null)

      const result = await sut.findByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('findById', () => {
    it('should find a user by id and return the mapped domain model', async () => {
      const user = getMockedMappedUser()

      jest.spyOn(mockedUserMapper, 'fromEntityToDomain').mockReturnValue(user)

      jest.spyOn(mockedPrismaService.user, 'findUnique').mockResolvedValue({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })

      const result = await sut.findById(user.id)

      expect(result).toBeDefined()
      expect(mockedPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
      })
      expect(result).toBe(user)
    })

    it('should return null if no user is found', async () => {
      jest.spyOn(mockedPrismaService.user, 'findUnique').mockResolvedValue(null)

      const result = await sut.findById('nonexistent-id')

      expect(result).toBeNull()
    })
  })
})
