import { Test } from '@nestjs/testing'
import { MembershipMapper } from '@/domain/mappers/membership.mapper'
import { Role } from '@/generated/prisma/enums'

describe('MembershipMapper', () => {
  let sut: MembershipMapper

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MembershipMapper],
    }).compile()

    sut = moduleRef.get<MembershipMapper>(MembershipMapper)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('fromEntityToDomain', () => {
    it('should map PrismaMembership entity to Membership domain model', () => {
      const entity = {
        id: 'membership-id-123',
        userId: 'user-id-123',
        companyId: 'company-id-123',
        role: Role.OWNER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = sut.fromEntityToDomain(entity)

      expect(result).toBeDefined()
      expect(result.id).toBe(entity.id)
      expect(result.userId).toBe(entity.userId)
      expect(result.companyId).toBe(entity.companyId)
      expect(result.role).toBe(entity.role)
      expect(result.isActive).toBe(entity.isActive)
      expect(result.createdAt).toBe(entity.createdAt)
      expect(result.updatedAt).toBe(entity.updatedAt)
    })

    it('should handle inactive membership', () => {
      const entity = {
        id: 'membership-id-456',
        userId: 'user-id-456',
        companyId: 'company-id-456',
        role: Role.MEMBER,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = sut.fromEntityToDomain(entity)

      expect(result).toBeDefined()
      expect(result.isActive).toBe(false)
      expect(result.role).toBe(Role.MEMBER)
    })

    it('should handle different roles', () => {
      const adminEntity = {
        id: 'membership-id-789',
        userId: 'user-id-789',
        companyId: 'company-id-789',
        role: Role.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = sut.fromEntityToDomain(adminEntity)

      expect(result.role).toBe(Role.ADMIN)
    })
  })

  describe('fromCreateInputToDomain', () => {
    it('should map CreateMembershipInput to Membership domain model', () => {
      const input = {
        userId: 'user-id-123',
        companyId: 'company-id-123',
        role: Role.OWNER,
        isActive: true,
      }

      const result = sut.fromCreateInputToDomain(input)

      expect(result).toBeDefined()
      expect(result.userId).toBe(input.userId)
      expect(result.companyId).toBe(input.companyId)
      expect(result.role).toBe(input.role)
      expect(result.isActive).toBe(input.isActive)
    })

    it('should create inactive membership when isActive is false', () => {
      const input = {
        userId: 'user-id-123',
        companyId: 'company-id-123',
        role: Role.OWNER,
        isActive: false,
      }

      const result = sut.fromCreateInputToDomain(input)

      expect(result.isActive).toBe(false)
    })

    it('should not set id, createdAt, and updatedAt fields', () => {
      const input = {
        userId: 'user-id-123',
        companyId: 'company-id-123',
        role: Role.MEMBER,
        isActive: true,
      }

      const result = sut.fromCreateInputToDomain(input)

      expect(result.id).toBeUndefined()
      expect(result.createdAt).toBeUndefined()
      expect(result.updatedAt).toBeUndefined()
    })
  })
})
