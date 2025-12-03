import { Invite } from '@/domain/models/invite'
import { Invite as PrismaInvite } from '@/generated/prisma/client'
import { Role } from '@/generated/prisma/enums'

export function getMockedInvite(): Invite {
  const invite = new Invite()
  invite.id = 'invite-id-123'
  invite.email = 'invitee@example.com'
  invite.userId = 'user-id-123'
  invite.companyId = 'company-id-123'
  invite.role = Role.MEMBER
  invite.token = 'invite-token-123'
  invite.createdAt = new Date()
  invite.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  invite.acceptedAt = null
  invite.revokedAt = null
  return invite
}

export function getMockedInviteEntity(): PrismaInvite {
  return {
    id: 'invite-id-123',
    email: 'invitee@example.com',
    userId: 'user-id-123',
    companyId: 'company-id-123',
    role: Role.MEMBER,
    token: 'invite-token-123',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    acceptedAt: null,
    revokedAt: null,
  }
}

export function getMockedAcceptedInvite(): Invite {
  const invite = getMockedInvite()
  invite.acceptedAt = new Date()
  return invite
}

export function getMockedRevokedInvite(): Invite {
  const invite = getMockedInvite()
  invite.revokedAt = new Date()
  return invite
}

export function getMockedExpiredInvite(): Invite {
  const invite = getMockedInvite()
  invite.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  return invite
}
