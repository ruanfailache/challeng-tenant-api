import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AwsModule } from './infrastructure/adapters/out/aws/aws.module'

@Module({
  imports: [ConfigModule.forRoot(), AwsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
