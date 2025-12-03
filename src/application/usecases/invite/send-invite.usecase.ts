import { randomUUID } from 'node:crypto'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InviteMapper } from '@/domain/mappers/invite.mapper'
import { Invite } from '@/domain/models/invite'
import { Role } from '@/generated/prisma/enums'
import { SendInviteRequest } from '@/infrastructure/adapters/in/rest/dto/requests/invite/send-invite.request'
import { SesService } from '@/infrastructure/adapters/out/aws/services/ses.service'
import { CompanyRepository } from '@/infrastructure/adapters/out/database/repositories/company.repository'
import { InviteRepository } from '@/infrastructure/adapters/out/database/repositories/invite.repository'
import { MembershipRepository } from '@/infrastructure/adapters/out/database/repositories/membership.repository'

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

@Injectable()
export class SendInviteUseCase {
  constructor(
    private readonly inviteMapper: InviteMapper,
    private readonly inviteRepository: InviteRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly sesService: SesService,
    private readonly configService: ConfigService,
  ) {}

  async execute(request: SendInviteRequest, companyId: string, userId: string): Promise<Invite> {
    const company = await this.companyRepository.findById(companyId)
    if (!company) {
      throw new NotFoundException('Company not found')
    }

    const membership = await this.membershipRepository.findByUserIdAndCompanyId(userId, companyId)
    if (!membership) {
      throw new ForbiddenException('You are not a member of this company')
    }

    if (membership.role !== Role.OWNER && membership.role !== Role.ADMIN) {
      throw new ForbiddenException('Only owners and admins can send invites')
    }

    const token = randomUUID()
    const expiresAt = new Date(Date.now() + ONE_DAY_IN_MS)

    const invite = this.inviteMapper.fromCreateInputToDomain({
      email: request.email,
      userId,
      companyId,
      role: request.role,
      token,
      expiresAt,
    })

    const createdInvite = await this.inviteRepository.create(invite)

    await this.sendInviteEmail(request.email, company.name, token)

    return createdInvite
  }

  private async sendInviteEmail(email: string, companyName: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000')
    const inviteLink = `${appUrl}/invite/accept?token=${token}`

    const subject = `You've been invited to join ${companyName}`
    const body = `
      <h1>You've been invited!</h1>
      <p>You have been invited to join <strong>${companyName}</strong>.</p>
      <p>Click the link below to accept the invitation:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
      <p>Your invite token: <strong>${token}</strong></p>
      <p>This invitation will expire in 24 hours.</p>
    `

    await this.sesService.sendEmail({
      to: email,
      subject,
      body,
      isHtml: true,
    })
  }
}
