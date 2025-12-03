import {
  getMockedMembership,
  getMockedMembershipEntity,
} from '@mocks/membership.mock'
import { Test } from '@nestjs/testing'
import { MembershipMapper } from '@/domain/mappers/membership.mapper'
import { Role } from '@/generated/prisma/enums'
import { MembershipRepository } from '@/infrastructure/adapters/out/database/repositories/membership.repository'
import { PrismaService } from '@/infrastructure/adapters/out/database/services/prisma.service'

const MOCKED_MEMBERSHIP = getMockedMembership()
const MOCKED_MEMBERSHIP_ENTITY = getMockedMembershipEntity()

describe('MembershipRepository', () => {
  let sut: MembershipRepository

  let mockedPrismaService: PrismaService
  let mockedMembershipMapper: MembershipMapper

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MembershipRepository, MembershipMapper, PrismaService],
    }).compile()

    sut = moduleRef.get<MembershipRepository>(MembershipRepository)

    mockedPrismaService = moduleRef.get<PrismaService>(PrismaService)
    mockedMembershipMapper = moduleRef.get<MembershipMapper>(MembershipMapper)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
    expect(mockedPrismaService).toBeDefined()
    expect(mockedMembershipMapper).toBeDefined()
  })

  describe('create', () => {
    it('should create a new membership and return the domain model', async () => {
      jest
        .spyOn(mockedMembershipMapper, 'fromEntityToDomain')
        .mockReturnValue(MOCKED_MEMBERSHIP)

      jest
        .spyOn(mockedPrismaService.membership, 'create')
        .mockResolvedValue(MOCKED_MEMBERSHIP_ENTITY)

      const result = await sut.create(MOCKED_MEMBERSHIP)

      expect(mockedPrismaService.membership.create).toHaveBeenCalledWith({
        data: {
          userId: MOCKED_MEMBERSHIP.userId,
          companyId: MOCKED_MEMBERSHIP.companyId,
          role: MOCKED_MEMBERSHIP.role,
          isActive: MOCKED_MEMBERSHIP.isActive,
        },
      })
      expect(mockedMembershipMapper.fromEntityToDomain).toHaveBeenCalledWith(
        MOCKED_MEMBERSHIP_ENTITY,
      )
      expect(result).toBe(MOCKED_MEMBERSHIP)
    })
  })

  describe('findByUserId', () => {
    it('should return an array of membership domain models', async () => {
      jest
        .spyOn(mockedPrismaService.membership, 'findMany')
        .mockResolvedValue([MOCKED_MEMBERSHIP_ENTITY])

      jest
        .spyOn(mockedMembershipMapper, 'fromEntityToDomain')
        .mockReturnValue(MOCKED_MEMBERSHIP)

      const result = await sut.findByUserId(MOCKED_MEMBERSHIP.userId)

      expect(mockedPrismaService.membership.findMany).toHaveBeenCalledWith({
        where: { userId: MOCKED_MEMBERSHIP.userId },
      })
      expect(mockedMembershipMapper.fromEntityToDomain).toHaveBeenCalledWith(
        MOCKED_MEMBERSHIP_ENTITY,
      )
      expect(result).toHaveLength(1)
      expect(result[0]).toBe(MOCKED_MEMBERSHIP)
    })

    it('should return an empty array when no memberships are found', async () => {
      jest
        .spyOn(mockedPrismaService.membership, 'findMany')
        .mockResolvedValue([])

      const result = await sut.findByUserId('non-existent-user-id')

      expect(mockedPrismaService.membership.findMany).toHaveBeenCalledWith({
        where: { userId: 'non-existent-user-id' },
      })
      expect(result).toHaveLength(0)
    })
  })

  describe('findActiveByUserId', () => {
    it('should return the active membership domain model when found', async () => {
      jest
        .spyOn(mockedPrismaService.membership, 'findFirst')
        .mockResolvedValue(MOCKED_MEMBERSHIP_ENTITY)

      jest
        .spyOn(mockedMembershipMapper, 'fromEntityToDomain')
        .mockReturnValue(MOCKED_MEMBERSHIP)

      const result = await sut.findActiveByUserId(MOCKED_MEMBERSHIP.userId)

      expect(mockedPrismaService.membership.findFirst).toHaveBeenCalledWith({
        where: { userId: MOCKED_MEMBERSHIP.userId, isActive: true },
      })
      expect(mockedMembershipMapper.fromEntityToDomain).toHaveBeenCalledWith(
        MOCKED_MEMBERSHIP_ENTITY,
      )
      expect(result).toBe(MOCKED_MEMBERSHIP)
    })

    it('should return null when no active membership is found', async () => {
      jest
        .spyOn(mockedPrismaService.membership, 'findFirst')
        .mockResolvedValue(null)

      const result = await sut.findActiveByUserId(
        'user-without-active-membership',
      )

      expect(mockedPrismaService.membership.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-without-active-membership', isActive: true },
      })
      expect(result).toBeNull()
    })
  })

  describe('findByUserIdAndCompanyId', () => {
    it('should return the membership domain model when found', async () => {
      jest
        .spyOn(mockedPrismaService.membership, 'findUnique')
        .mockResolvedValue(MOCKED_MEMBERSHIP_ENTITY)

      jest
        .spyOn(mockedMembershipMapper, 'fromEntityToDomain')
        .mockReturnValue(MOCKED_MEMBERSHIP)

      const result = await sut.findByUserIdAndCompanyId(
        MOCKED_MEMBERSHIP.userId,
        MOCKED_MEMBERSHIP.companyId,
      )

      expect(mockedPrismaService.membership.findUnique).toHaveBeenCalledWith({
        where: {
          userId_companyId: {
            userId: MOCKED_MEMBERSHIP.userId,
            companyId: MOCKED_MEMBERSHIP.companyId,
          },
        },
      })
      expect(mockedMembershipMapper.fromEntityToDomain).toHaveBeenCalledWith(
        MOCKED_MEMBERSHIP_ENTITY,
      )
      expect(result).toBe(MOCKED_MEMBERSHIP)
    })

    it('should return null when membership is not found', async () => {
      jest
        .spyOn(mockedPrismaService.membership, 'findUnique')
        .mockResolvedValue(null)

      const result = await sut.findByUserIdAndCompanyId(
        'non-existent-user-id',
        'non-existent-company-id',
      )

      expect(mockedPrismaService.membership.findUnique).toHaveBeenCalledWith({
        where: {
          userId_companyId: {
            userId: 'non-existent-user-id',
            companyId: 'non-existent-company-id',
          },
        },
      })
      expect(result).toBeNull()
    })
  })

  describe('deactivateAllByUserId', () => {
    it('should deactivate all active memberships for a user', async () => {
      jest
        .spyOn(mockedPrismaService.membership, 'updateMany')
        .mockResolvedValue({ count: 2 })

      await sut.deactivateAllByUserId(MOCKED_MEMBERSHIP.userId)

      expect(mockedPrismaService.membership.updateMany).toHaveBeenCalledWith({
        where: { userId: MOCKED_MEMBERSHIP.userId, isActive: true },
        data: { isActive: false },
      })
    })

    it('should not throw when no active memberships exist', async () => {
      jest
        .spyOn(mockedPrismaService.membership, 'updateMany')
        .mockResolvedValue({ count: 0 })

      await expect(
        sut.deactivateAllByUserId('user-without-memberships'),
      ).resolves.not.toThrow()

      expect(mockedPrismaService.membership.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-without-memberships', isActive: true },
        data: { isActive: false },
      })
    })
  })

  describe('activateByUserIdAndCompanyId', () => {
    it('should activate a membership and return the domain model', async () => {
      const activatedEntity = { ...MOCKED_MEMBERSHIP_ENTITY, isActive: true }

      jest
        .spyOn(mockedPrismaService.membership, 'update')
        .mockResolvedValue(activatedEntity)

      jest
        .spyOn(mockedMembershipMapper, 'fromEntityToDomain')
        .mockReturnValue({ ...MOCKED_MEMBERSHIP, isActive: true })

      const result = await sut.activateByUserIdAndCompanyId(
        MOCKED_MEMBERSHIP.userId,
        MOCKED_MEMBERSHIP.companyId,
      )

      expect(mockedPrismaService.membership.update).toHaveBeenCalledWith({
        where: {
          userId_companyId: {
            userId: MOCKED_MEMBERSHIP.userId,
            companyId: MOCKED_MEMBERSHIP.companyId,
          },
        },
        data: { isActive: true },
      })
      expect(mockedMembershipMapper.fromEntityToDomain).toHaveBeenCalledWith(
        activatedEntity,
      )
      expect(result.isActive).toBe(true)
    })
  })
})
