import { Module } from '@nestjs/common'
import { AwsModule } from './aws/aws.module'
import { PrismaModule } from './database/prisma.module'

const modules = [PrismaModule, AwsModule]

@Module({
  imports: modules,
  providers: modules,
})
export class OutModule {}
