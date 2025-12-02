import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module';
import { AwsModule } from './aws/aws.module';

const modules = [PrismaModule, AwsModule];

@Module({
  imports: modules,
  providers: modules,
})
export class OutModule {}
