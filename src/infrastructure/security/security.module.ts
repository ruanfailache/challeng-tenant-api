import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { SecurityService } from './services/security.service'
import { CryptorUtil } from './utils/cryptor.util'

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [SecurityService, CryptorUtil],
  exports: [SecurityService, CryptorUtil],
})
export class SecurityModule {}
