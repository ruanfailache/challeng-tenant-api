import { Module } from '@nestjs/common'
import { AdapterModule } from './adapters/adapters.module';

const modules = [AdapterModule];

@Module({
  imports: modules,
  providers: modules,
})
export class InfrastructureModule {}
