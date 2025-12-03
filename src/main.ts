import { INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Tenant API')
    .setDescription('API for tenant management')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
}

function configureGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe())
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  configureSwagger(app)
  configureGlobalPipes(app)
  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
