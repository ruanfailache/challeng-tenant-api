import { Injectable } from '@nestjs/common'
import { Membership } from '@/domain/models/membership'
import { Membership as PrismaMembership } from '@/generated/prisma/client'
import { Role } from '@/generated/prisma/enums'

export interface CreateMembershipInput {
  userId: string
  companyId: string
  role: Role
  isActive: boolean
}

@Injectable()
export class MembershipMapper {
  fromEntityToDomain(entity: PrismaMembership): Membership {
    const membership = new Membership()
    membership.id = entity.id
    membership.userId = entity.userId
    membership.companyId = entity.companyId
    membership.role = entity.role
    membership.isActive = entity.isActive
    membership.createdAt = entity.createdAt
    membership.updatedAt = entity.updatedAt
    return membership
  }

  fromCreateInputToDomain(input: CreateMembershipInput): Membership {
    const membership = new Membership()
    membership.userId = input.userId
    membership.companyId = input.companyId
    membership.role = input.role
    membership.isActive = input.isActive
    return membership
  }
}
