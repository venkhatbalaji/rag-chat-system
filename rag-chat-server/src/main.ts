import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppClusterService } from './common/utils/app-cluster.service';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const config = app.get(ConfigService);
  const appName = config.get<string>('domain') || 'Chat Storage Service';
  const env = config.get<string>('env') || 'development';
  const port = config.get<number>('port') || 3000;

  // Logger Configuration
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Set Global Prefix
  app.setGlobalPrefix('api/v1');

  // Enable Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable Global Filter
  app.useGlobalFilters(
    new GlobalExceptionFilter(app.get(WINSTON_MODULE_NEST_PROVIDER)),
  );

  // Enable CORS
  app.enableCors({
    origin: [
      `${appName}.io`,
      'https://raven.ravex.io',
      'http://localhost:3000',
      'https://dev-raven.ravex.io:3002',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'OPTIONS', 'DELETE'],
    credentials: true,
  });

  // Set Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-origin' },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  // Swagger Configuration
  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(`${appName}.api`)
      .setDescription(`${appName}.api Documentation`)
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableShutdownHooks();

  await app.listen(port || 3001);
}
if (process.env.NODE_ENV === 'production') {
  AppClusterService.cluster(bootstrap);
} else {
  bootstrap();
}
