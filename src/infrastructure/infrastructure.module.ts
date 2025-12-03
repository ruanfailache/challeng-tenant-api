import { Module } from '@nestjs/common'
import { AdapterModule } from './adapters/adapters.module'
import { SecurityModule } from './security/security.module'

const modules = [AdapterModule, SecurityModule]

@Module({
  imports: modules,
  providers: modules,
  exports: modules,
})
export class InfrastructureModule {}
