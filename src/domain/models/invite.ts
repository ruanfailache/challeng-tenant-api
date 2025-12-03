import { Role } from '@/generated/prisma/enums'

export class Invite {
  id: string
  email: string
  userId: string
  companyId: string
  role: Role
  token: string
  createdAt: Date
  expiresAt: Date
  acceptedAt: Date | null
  revokedAt: Date | null
}
