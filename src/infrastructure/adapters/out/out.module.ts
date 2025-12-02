import { Module } from '@nestjs/common'
import { AwsModule } from './aws/aws.module'
import { PrismaModule } from './prisma/prisma.module'

const modules = [PrismaModule, AwsModule]

@Module({
  imports: modules,
  providers: modules,
})
export class OutModule {}
