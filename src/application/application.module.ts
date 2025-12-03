import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DomainModule } from '@/domain/domain.module'
import { OutModule } from '@/infrastructure/adapters/out/out.module'
import { SecurityModule } from '@/infrastructure/security/security.module'
import { CreateCompanyUseCase } from './usecases/company/create-company.usecase'
import { ListUserCompaniesUseCase } from './usecases/company/list-user-companies.usecase'
import { SelectCompanyUseCase } from './usecases/company/select-company.usecase'
import { SendInviteUseCase } from './usecases/invite/send-invite.usecase'
import { CreateUserUseCase } from './usecases/user/create-user.usecase'

const useCases = [
  // Company Use Cases
  CreateCompanyUseCase,
  ListUserCompaniesUseCase,
  SelectCompanyUseCase,

  // Invite Use Cases
  SendInviteUseCase,

  // User Use Cases
  CreateUserUseCase,
]

@Module({
  imports: [ConfigModule, OutModule, SecurityModule, DomainModule],
  providers: [...useCases],
  exports: [...useCases],
})
export class ApplicationModule {}
