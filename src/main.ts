import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
  );

  app.use(helmet());
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  app.use(cookieParser());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();