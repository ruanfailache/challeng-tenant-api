import { Module } from '@nestjs/common'
import { InModule } from './in/in.module'
import { OutModule } from './out/out.module'

const modules = [InModule, OutModule]

@Module({
  imports: modules,
  providers: modules,
  exports: modules,
})
export class AdapterModule {}
