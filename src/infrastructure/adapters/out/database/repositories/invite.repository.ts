import { Injectable } from '@nestjs/common'
import { InviteMapper } from '@/domain/mappers/invite.mapper'
import { Invite } from '@/domain/models/invite'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class InviteRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly inviteMapper: InviteMapper,
  ) {}

  async create(invite: Invite): Promise<Invite> {
    const createdInvite = await this.prismaService.invite.create({
      data: {
        email: invite.email,
        userId: invite.userId,
        companyId: invite.companyId,
        role: invite.role,
        token: invite.token,
        expiresAt: invite.expiresAt,
      },
    })
    return this.inviteMapper.fromEntityToDomain(createdInvite)
  }

  async findById(id: string): Promise<Invite | null> {
    const invite = await this.prismaService.invite.findUnique({
      where: { id },
    })
    if (!invite) {
      return null
    }
    return this.inviteMapper.fromEntityToDomain(invite)
  }

  async findByToken(token: string): Promise<Invite | null> {
    const invite = await this.prismaService.invite.findUnique({
      where: { token },
    })
    if (!invite) {
      return null
    }
    return this.inviteMapper.fromEntityToDomain(invite)
  }

  async findByCompanyId(companyId: string): Promise<Invite[]> {
    const invites = await this.prismaService.invite.findMany({
      where: { companyId },
    })
    return invites.map((i) => this.inviteMapper.fromEntityToDomain(i))
  }

  async findByUserId(userId: string): Promise<Invite[]> {
    const invites = await this.prismaService.invite.findMany({
      where: { userId },
    })
    return invites.map((i) => this.inviteMapper.fromEntityToDomain(i))
  }

  async accept(id: string): Promise<Invite> {
    const updatedInvite = await this.prismaService.invite.update({
      where: { id },
      data: { acceptedAt: new Date() },
    })
    return this.inviteMapper.fromEntityToDomain(updatedInvite)
  }

  async revoke(id: string): Promise<Invite> {
    const updatedInvite = await this.prismaService.invite.update({
      where: { id },
      data: { revokedAt: new Date() },
    })
    return this.inviteMapper.fromEntityToDomain(updatedInvite)
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.invite.delete({
      where: { id },
    })
  }
}
