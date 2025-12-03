import { Test } from '@nestjs/testing'
import { InviteMapper } from '@/domain/mappers/invite.mapper'
import { Role } from '@/generated/prisma/enums'

describe('InviteMapper', () => {
  let sut: InviteMapper

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [InviteMapper],
    }).compile()

    sut = moduleRef.get<InviteMapper>(InviteMapper)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('fromEntityToDomain', () => {
    it('should map PrismaInvite entity to Invite domain model', () => {
      const entity = {
        id: 'invite-id-123',
        email: 'invitee@example.com',
        userId: 'user-id-123',
        companyId: 'company-id-123',
        role: Role.MEMBER,
        token: 'invite-token-123',
        createdAt: new Date(),
        expiresAt: new Date(),
        acceptedAt: null,
        revokedAt: null,
      }

      const result = sut.fromEntityToDomain(entity)

      expect(result).toBeDefined()
      expect(result.id).toBe(entity.id)
      expect(result.email).toBe(entity.email)
      expect(result.userId).toBe(entity.userId)
      expect(result.companyId).toBe(entity.companyId)
      expect(result.role).toBe(entity.role)
      expect(result.token).toBe(entity.token)
      expect(result.createdAt).toBe(entity.createdAt)
      expect(result.expiresAt).toBe(entity.expiresAt)
      expect(result.acceptedAt).toBe(entity.acceptedAt)
      expect(result.revokedAt).toBe(entity.revokedAt)
    })

    it('should handle accepted invite', () => {
      const acceptedAt = new Date()
      const entity = {
        id: 'invite-id-456',
        email: 'accepted@example.com',
        userId: 'user-id-456',
        companyId: 'company-id-456',
        role: Role.ADMIN,
        token: 'invite-token-456',
        createdAt: new Date(),
        expiresAt: new Date(),
        acceptedAt,
        revokedAt: null,
      }

      const result = sut.fromEntityToDomain(entity)

      expect(result).toBeDefined()
      expect(result.acceptedAt).toBe(acceptedAt)
      expect(result.revokedAt).toBeNull()
    })

    it('should handle revoked invite', () => {
      const revokedAt = new Date()
      const entity = {
        id: 'invite-id-789',
        email: 'revoked@example.com',
        userId: 'user-id-789',
        companyId: 'company-id-789',
        role: Role.MEMBER,
        token: 'invite-token-789',
        createdAt: new Date(),
        expiresAt: new Date(),
        acceptedAt: null,
        revokedAt,
      }

      const result = sut.fromEntityToDomain(entity)

      expect(result).toBeDefined()
      expect(result.acceptedAt).toBeNull()
      expect(result.revokedAt).toBe(revokedAt)
    })

    it('should handle different roles', () => {
      const ownerEntity = {
        id: 'invite-id-owner',
        email: 'owner@example.com',
        userId: 'user-id-owner',
        companyId: 'company-id-owner',
        role: Role.OWNER,
        token: 'invite-token-owner',
        createdAt: new Date(),
        expiresAt: new Date(),
        acceptedAt: null,
        revokedAt: null,
      }

      const result = sut.fromEntityToDomain(ownerEntity)

      expect(result.role).toBe(Role.OWNER)
    })
  })

  describe('fromCreateInputToDomain', () => {
    it('should map CreateInviteInput to Invite domain model', () => {
      const input = {
        email: 'invitee@example.com',
        userId: 'user-id-123',
        companyId: 'company-id-123',
        role: Role.MEMBER,
        token: 'invite-token-123',
        expiresAt: new Date(),
      }

      const result = sut.fromCreateInputToDomain(input)

      expect(result).toBeDefined()
      expect(result.email).toBe(input.email)
      expect(result.userId).toBe(input.userId)
      expect(result.companyId).toBe(input.companyId)
      expect(result.role).toBe(input.role)
      expect(result.token).toBe(input.token)
      expect(result.expiresAt).toBe(input.expiresAt)
    })

    it('should create invite with ADMIN role', () => {
      const input = {
        email: 'admin@example.com',
        userId: 'user-id-123',
        companyId: 'company-id-123',
        role: Role.ADMIN,
        token: 'invite-token-admin',
        expiresAt: new Date(),
      }

      const result = sut.fromCreateInputToDomain(input)

      expect(result.role).toBe(Role.ADMIN)
    })

    it('should not set id, createdAt, acceptedAt, and revokedAt fields', () => {
      const input = {
        email: 'invitee@example.com',
        userId: 'user-id-123',
        companyId: 'company-id-123',
        role: Role.MEMBER,
        token: 'invite-token-123',
        expiresAt: new Date(),
      }

      const result = sut.fromCreateInputToDomain(input)

      expect(result.id).toBeUndefined()
      expect(result.createdAt).toBeUndefined()
      expect(result.acceptedAt).toBeUndefined()
      expect(result.revokedAt).toBeUndefined()
    })
  })
})
