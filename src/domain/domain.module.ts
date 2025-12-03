import { Module } from '@nestjs/common'
import { CompanyMapper } from './mappers/company.mapper'
import { InviteMapper } from './mappers/invite.mapper'
import { MembershipMapper } from './mappers/membership.mapper'
import { UserMapper } from './mappers/user.mapper'

const mappers = [CompanyMapper, InviteMapper, MembershipMapper, UserMapper]

@Module({
  providers: [...mappers],
  exports: [...mappers],
})
export class DomainModule {}
