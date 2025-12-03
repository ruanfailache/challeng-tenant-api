import { Module } from '@nestjs/common'
import { AwsModule } from './aws/aws.module'
import { DatabaseModule } from './database/database.module'

const modules = [DatabaseModule, AwsModule]

@Module({
  imports: modules,
  providers: modules,
  exports: modules,
})
export class OutModule {}
