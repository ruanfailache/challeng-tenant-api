import { Module } from '@nestjs/common'
import { ApplicationModule } from '@/application/application.module'
import { SecurityModule } from '@/infrastructure/security/security.module'
import { AuthController } from './rest/controllers/auth.controller'
import { CompanyController } from './rest/controllers/company.controller'

@Module({
  imports: [ApplicationModule, SecurityModule],
  controllers: [AuthController, CompanyController],
})
export class InModule {}
