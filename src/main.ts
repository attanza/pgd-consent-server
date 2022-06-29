import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { envalidate } from './utils/envalidate';
import { NestExpressApplication } from '@nestjs/platform-express';
import mongoose from 'mongoose';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import morgan from 'morgan';
import { AllExceptionsFilter } from './utils/http-exception.filter';
import { RolesGuard } from './shared/guards/roles.guard';
async function bootstrap() {
  envalidate();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  mongoose.set('debug', process.env.NODE_ENV === 'development');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const PORT = process.env.PORT;
  app.disable('x-powered-by');
  app.enableCors({
    origin: [process.env.FRONT_END_URL],
  });
  app.use(helmet());
  app.use(morgan('combined'));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(PORT);
  Logger.log(`App running at http://localhost:${PORT}`, 'Bootstrap');
}
bootstrap();
