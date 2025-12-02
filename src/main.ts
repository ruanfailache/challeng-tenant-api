import { INestApplication } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AuthGuard } from './infrastructure/security/guards/auth.guard'

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Tenant API')
    .setDescription('API for tenant management')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api', app, document)
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  configureSwagger(app)
  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
