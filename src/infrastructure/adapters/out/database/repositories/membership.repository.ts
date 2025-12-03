import { Injectable } from '@nestjs/common'
import { MembershipMapper } from '@/domain/mappers/membership.mapper'
import { Membership } from '@/domain/models/membership'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class MembershipRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly membershipMapper: MembershipMapper,
  ) {}

  async create(membership: Membership): Promise<Membership> {
    const createdMembership = await this.prismaService.membership.create({
      data: {
        userId: membership.userId,
        companyId: membership.companyId,
        role: membership.role,
        isActive: membership.isActive,
      },
    })
    return this.membershipMapper.fromEntityToDomain(createdMembership)
  }

  async findByUserId(userId: string): Promise<Membership[]> {
    const memberships = await this.prismaService.membership.findMany({
      where: { userId },
    })
    return memberships.map((m) => this.membershipMapper.fromEntityToDomain(m))
  }

  async findActiveByUserId(userId: string): Promise<Membership | null> {
    const membership = await this.prismaService.membership.findFirst({
      where: { userId, isActive: true },
    })
    if (!membership) {
      return null
    }
    return this.membershipMapper.fromEntityToDomain(membership)
  }

  async findByUserIdAndCompanyId(
    userId: string,
    companyId: string,
  ): Promise<Membership | null> {
    const membership = await this.prismaService.membership.findUnique({
      where: { userId_companyId: { userId, companyId } },
    })
    if (!membership) {
      return null
    }
    return this.membershipMapper.fromEntityToDomain(membership)
  }

  async deactivateAllByUserId(userId: string): Promise<void> {
    await this.prismaService.membership.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    })
  }

  async activateByUserIdAndCompanyId(
    userId: string,
    companyId: string,
  ): Promise<Membership> {
    const updatedMembership = await this.prismaService.membership.update({
      where: { userId_companyId: { userId, companyId } },
      data: { isActive: true },
    })
    return this.membershipMapper.fromEntityToDomain(updatedMembership)
  }
}
