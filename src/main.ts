import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {
  // Para saber el puerto
  const logger = new Logger('Payments-microservice')

  const app = await NestFactory.create(AppModule,{
    rawBody: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    })
    );


  await app.listen(envs.port);
    //Puerto en envs
  logger.log(`Payments microservice running on port ${envs.port}`)
}
bootstrap();
