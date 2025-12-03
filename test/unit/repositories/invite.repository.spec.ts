import { getMockedInvite, getMockedInviteEntity } from '@mocks/invite.mock'
import { Test } from '@nestjs/testing'
import { InviteMapper } from '@/domain/mappers/invite.mapper'
import { InviteRepository } from '@/infrastructure/adapters/out/database/repositories/invite.repository'
import { PrismaService } from '@/infrastructure/adapters/out/database/services/prisma.service'

const MOCKED_INVITE = getMockedInvite()
const MOCKED_INVITE_ENTITY = getMockedInviteEntity()

describe('InviteRepository', () => {
  let sut: InviteRepository

  let mockedPrismaService: PrismaService
  let mockedInviteMapper: InviteMapper

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [InviteRepository, InviteMapper, PrismaService],
    }).compile()

    sut = moduleRef.get<InviteRepository>(InviteRepository)

    mockedPrismaService = moduleRef.get<PrismaService>(PrismaService)
    mockedInviteMapper = moduleRef.get<InviteMapper>(InviteMapper)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
    expect(mockedPrismaService).toBeDefined()
    expect(mockedInviteMapper).toBeDefined()
  })

  describe('create', () => {
    it('should create a new invite and return the domain model', async () => {
      jest
        .spyOn(mockedInviteMapper, 'fromEntityToDomain')
        .mockReturnValue(MOCKED_INVITE)

      jest
        .spyOn(mockedPrismaService.invite, 'create')
        .mockResolvedValue(MOCKED_INVITE_ENTITY)

      const result = await sut.create(MOCKED_INVITE)

      expect(mockedPrismaService.invite.create).toHaveBeenCalledWith({
        data: {
          email: MOCKED_INVITE.email,
          userId: MOCKED_INVITE.userId,
          companyId: MOCKED_INVITE.companyId,
          role: MOCKED_INVITE.role,
          token: MOCKED_INVITE.token,
          expiresAt: MOCKED_INVITE.expiresAt,
        },
      })
      expect(mockedInviteMapper.fromEntityToDomain).toHaveBeenCalledWith(
        MOCKED_INVITE_ENTITY,
      )
      expect(result).toBe(MOCKED_INVITE)
    })
  })

  describe('findById', () => {
    it('should return the invite domain model when found', async () => {
      jest
        .spyOn(mockedPrismaService.invite, 'findUnique')
        .mockResolvedValue(MOCKED_INVITE_ENTITY)

      jest
        .spyOn(mockedInviteMapper, 'fromEntityToDomain')
        .mockReturnValue(MOCKED_INVITE)

      const result = await sut.findById(MOCKED_INVITE.id)

      expect(mockedPrismaService.invite.findUnique).toHaveBeenCalledWith({
        where: { id: MOCKED_INVITE.id },
      })
      expect(mockedInviteMapper.fromEntityToDomain).toHaveBeenCalledWith(
        MOCKED_INVITE_ENTITY,
      )
      expect(result).toBe(MOCKED_INVITE)
    })

    it('should return null when invite is not found', async () => {
      jest
        .spyOn(mockedPrismaService.invite, 'findUnique')
        .mockResolvedValue(null)

      const result = await sut.findById('non-existent-id')

      expect(mockedPrismaService.invite.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      })
      expect(result).toBeNull()
    })
  })

  describe('findByToken', () => {
    it('should return the invite domain model when found', async () => {
      jest
        .spyOn(mockedPrismaService.invite, 'findUnique')
        .mockResolvedValue(MOCKED_INVITE_ENTITY)

      jest
        .spyOn(mockedInviteMapper, 'fromEntityToDomain')
        .mockReturnValue(MOCKED_INVITE)

      const result = await sut.findByToken(MOCKED_INVITE.token)

      expect(mockedPrismaService.invite.findUnique).toHaveBeenCalledWith({
        where: { token: MOCKED_INVITE.token },
      })
      expect(mockedInviteMapper.fromEntityToDomain).toHaveBeenCalledWith(
        MOCKED_INVITE_ENTITY,
      )
      expect(result).toBe(MOCKED_INVITE)
    })

    it('should return null when invite is not found', async () => {
      jest
        .spyOn(mockedPrismaService.invite, 'findUnique')
        .mockResolvedValue(null)

      const result = await sut.findByToken('non-existent-token')

      expect(mockedPrismaService.invite.findUnique).toHaveBeenCalledWith({
        where: { token: 'non-existent-token' },
      })
      expect(result).toBeNull()
    })
  })

  describe('findByCompanyId', () => {
    it('should return an array of invite domain models', async () => {
      jest
        .spyOn(mockedPrismaService.invite, 'findMany')
        .mockResolvedValue([MOCKED_INVITE_ENTITY])

      jest
        .spyOn(mockedInviteMapper, 'fromEntityToDomain')
        .mockReturnValue(MOCKED_INVITE)

      const result = await sut.findByCompanyId(MOCKED_INVITE.companyId)

      expect(mockedPrismaService.invite.findMany).toHaveBeenCalledWith({
        where: { companyId: MOCKED_INVITE.companyId },
      })
      expect(mockedInviteMapper.fromEntityToDomain).toHaveBeenCalledWith(
        MOCKED_INVITE_ENTITY,
      )
      expect(result).toHaveLength(1)
      expect(result[0]).toBe(MOCKED_INVITE)
    })

    it('should return an empty array when no invites are found', async () => {
      jest.spyOn(mockedPrismaService.invite, 'findMany').mockResolvedValue([])

      const result = await sut.findByCompanyId('non-existent-company-id')

      expect(mockedPrismaService.invite.findMany).toHaveBeenCalledWith({
        where: { companyId: 'non-existent-company-id' },
      })
      expect(result).toHaveLength(0)
    })
  })

  describe('findByUserId', () => {
    it('should return an array of invite domain models', async () => {
      jest
        .spyOn(mockedPrismaService.invite, 'findMany')
        .mockResolvedValue([MOCKED_INVITE_ENTITY])

      jest
        .spyOn(mockedInviteMapper, 'fromEntityToDomain')
        .mockReturnValue(MOCKED_INVITE)

      const result = await sut.findByUserId(MOCKED_INVITE.userId)

      expect(mockedPrismaService.invite.findMany).toHaveBeenCalledWith({
        where: { userId: MOCKED_INVITE.userId },
      })
      expect(mockedInviteMapper.fromEntityToDomain).toHaveBeenCalledWith(
        MOCKED_INVITE_ENTITY,
      )
      expect(result).toHaveLength(1)
      expect(result[0]).toBe(MOCKED_INVITE)
    })

    it('should return an empty array when no invites are found', async () => {
      jest.spyOn(mockedPrismaService.invite, 'findMany').mockResolvedValue([])

      const result = await sut.findByUserId('non-existent-user-id')

      expect(mockedPrismaService.invite.findMany).toHaveBeenCalledWith({
        where: { userId: 'non-existent-user-id' },
      })
      expect(result).toHaveLength(0)
    })
  })

  describe('accept', () => {
    it('should accept an invite and return the domain model', async () => {
      const acceptedEntity = { ...MOCKED_INVITE_ENTITY, acceptedAt: new Date() }
      const acceptedInvite = { ...MOCKED_INVITE, acceptedAt: new Date() }

      jest
        .spyOn(mockedPrismaService.invite, 'update')
        .mockResolvedValue(acceptedEntity)

      jest
        .spyOn(mockedInviteMapper, 'fromEntityToDomain')
        .mockReturnValue(acceptedInvite)

      const result = await sut.accept(MOCKED_INVITE.id)

      expect(mockedPrismaService.invite.update).toHaveBeenCalledWith({
        where: { id: MOCKED_INVITE.id },
        data: { acceptedAt: expect.any(Date) },
      })
      expect(mockedInviteMapper.fromEntityToDomain).toHaveBeenCalledWith(
        acceptedEntity,
      )
      expect(result.acceptedAt).toBeDefined()
    })
  })

  describe('revoke', () => {
    it('should revoke an invite and return the domain model', async () => {
      const revokedEntity = { ...MOCKED_INVITE_ENTITY, revokedAt: new Date() }
      const revokedInvite = { ...MOCKED_INVITE, revokedAt: new Date() }

      jest
        .spyOn(mockedPrismaService.invite, 'update')
        .mockResolvedValue(revokedEntity)

      jest
        .spyOn(mockedInviteMapper, 'fromEntityToDomain')
        .mockReturnValue(revokedInvite)

      const result = await sut.revoke(MOCKED_INVITE.id)

      expect(mockedPrismaService.invite.update).toHaveBeenCalledWith({
        where: { id: MOCKED_INVITE.id },
        data: { revokedAt: expect.any(Date) },
      })
      expect(mockedInviteMapper.fromEntityToDomain).toHaveBeenCalledWith(
        revokedEntity,
      )
      expect(result.revokedAt).toBeDefined()
    })
  })

  describe('delete', () => {
    it('should delete an invite', async () => {
      jest
        .spyOn(mockedPrismaService.invite, 'delete')
        .mockResolvedValue(MOCKED_INVITE_ENTITY)

      await sut.delete(MOCKED_INVITE.id)

      expect(mockedPrismaService.invite.delete).toHaveBeenCalledWith({
        where: { id: MOCKED_INVITE.id },
      })
    })
  })
})
