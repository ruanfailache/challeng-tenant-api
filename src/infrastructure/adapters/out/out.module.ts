import { Module } from '@nestjs/common'
import { AwsModule } from './aws/aws.module'
import { DatabaseModule } from './database/prisma.module'

const modules = [DatabaseModule, AwsModule]

@Module({
  imports: modules,
  providers: modules,
})
export class OutModule {}
