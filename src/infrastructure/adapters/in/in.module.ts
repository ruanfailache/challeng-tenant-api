import { Module } from '@nestjs/common'
import { ApplicationModule } from '@/application/application.module'
import { AuthController } from './rest/controllers/auth.controller'
import { CompanyController } from './rest/controllers/company.controller'

@Module({
  imports: [ApplicationModule],
  controllers: [AuthController, CompanyController],
})
export class InModule {}
