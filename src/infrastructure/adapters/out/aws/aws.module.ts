import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { S3Service } from './services/s3.service'
import { SesService } from './services/ses.service'

@Module({
  imports: [ConfigModule],
  providers: [S3Service, SesService],
  exports: [S3Service, SesService],
})
export class AwsModule {}
