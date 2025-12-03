import { Injectable } from '@nestjs/common'
import { Invite } from '@/domain/models/invite'
import { Invite as PrismaInvite } from '@/generated/prisma/client'
import { Role } from '@/generated/prisma/enums'

export interface CreateInviteInput {
  email: string
  userId: string
  companyId: string
  role: Role
  token: string
  expiresAt: Date
}

@Injectable()
export class InviteMapper {
  fromEntityToDomain(entity: PrismaInvite): Invite {
    const invite = new Invite()
    invite.id = entity.id
    invite.email = entity.email
    invite.userId = entity.userId
    invite.companyId = entity.companyId
    invite.role = entity.role
    invite.token = entity.token
    invite.createdAt = entity.createdAt
    invite.expiresAt = entity.expiresAt
    invite.acceptedAt = entity.acceptedAt
    invite.revokedAt = entity.revokedAt
    return invite
  }

  fromCreateInputToDomain(input: CreateInviteInput): Invite {
    const invite = new Invite()
    invite.email = input.email
    invite.userId = input.userId
    invite.companyId = input.companyId
    invite.role = input.role
    invite.token = input.token
    invite.expiresAt = input.expiresAt
    return invite
  }
}
