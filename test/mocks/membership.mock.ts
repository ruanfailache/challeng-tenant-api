import { Membership } from '@/domain/models/membership'
import { Membership as PrismaMembership } from '@/generated/prisma/client'
import { Role } from '@/generated/prisma/enums'

export function getMockedMembership(): Membership {
  const membership = new Membership()
  membership.id = 'membership-id-123'
  membership.userId = 'user-id-123'
  membership.companyId = 'company-id-123'
  membership.role = Role.OWNER
  membership.isActive = true
  membership.createdAt = new Date()
  membership.updatedAt = new Date()
  return membership
}

export function getMockedMembershipEntity(): PrismaMembership {
  return {
    id: 'membership-id-123',
    userId: 'user-id-123',
    companyId: 'company-id-123',
    role: Role.OWNER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function getMockedInactiveMembership(): Membership {
  const membership = getMockedMembership()
  membership.isActive = false
  return membership
}

export function getMockedOwnerMembership(userId: string, companyId: string, isActive: boolean): Membership {
  const membership = new Membership()
  membership.id = 'membership-id-123'
  membership.userId = userId
  membership.companyId = companyId
  membership.role = Role.OWNER
  membership.isActive = isActive
  membership.createdAt = new Date()
  membership.updatedAt = new Date()
  return membership
}
