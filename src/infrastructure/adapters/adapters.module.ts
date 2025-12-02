import { Module } from '@nestjs/common'
import { OutModule } from './out/out.module'

const modules = [OutModule]

@Module({
  imports: modules,
  providers: modules,
})
export class AdapterModule {}
