import { Role } from '@/generated/prisma/enums'

export class Membership {
  id: string
  userId: string
  companyId: string
  role: Role
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
