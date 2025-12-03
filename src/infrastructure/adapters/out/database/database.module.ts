import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DomainModule } from '@/domain/domain.module'
import { CompanyRepository } from './repositories/company.repository'
import { InviteRepository } from './repositories/invite.repository'
import { MembershipRepository } from './repositories/membership.repository'
import { UserRepository } from './repositories/user.repository'
import { PrismaService } from './services/prisma.service'

const repositories = [CompanyRepository, InviteRepository, MembershipRepository, UserRepository]

@Module({
  imports: [ConfigModule, DomainModule],
  providers: [PrismaService, ...repositories],
  exports: [...repositories],
})
export class DatabaseModule {}
