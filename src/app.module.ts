import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { InfrastructureModule } from './infrastructure/infrastructure.module'
import { AuthGuard } from './infrastructure/security/guards/auth.guard'

@Module({
  imports: [ConfigModule.forRoot(), InfrastructureModule],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
