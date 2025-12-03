import { ForbiddenException, Injectable } from '@nestjs/common'
import { Membership } from '@/domain/models/membership'
import { MembershipRepository } from '@/infrastructure/adapters/out/database/repositories/membership.repository'

@Injectable()
export class SelectCompanyUseCase {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  async execute(userId: string, companyId: string): Promise<Membership> {
    const membership = await this.membershipRepository.findByUserIdAndCompanyId(userId, companyId)

    if (!membership) {
      throw new ForbiddenException('User does not have membership with this company')
    }

    await this.membershipRepository.deactivateAllByUserId(userId)

    return this.membershipRepository.activateByUserIdAndCompanyId(userId, companyId)
  }
}
