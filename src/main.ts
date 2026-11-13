import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Next.js client
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global API Prefix
  app.setGlobalPrefix('api');

  // Global Validation Pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Doctor Tracker API')
    .setDescription('RESTful API specification for Doctor Tracker administration portal')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');

  logger.log(`====================================================`);
  logger.log(`🚀 NestJS Backend running at: http://localhost:${port}/api`);
  logger.log(`📖 Swagger API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`====================================================`);
  logger.log(`Registered Endpoints:`);
  
  const server = app.getHttpServer();
  const router = server._events.request._router;
  if (router && router.stack) {
    router.stack.forEach((layer: any) => {
      if (layer.route) {
        const path = layer.route?.path;
        const methods = Object.keys(layer.route.methods)
          .map((m) => m.toUpperCase())
          .join(', ');
        logger.log(`  [${methods.padEnd(6)}] ${path}`);
      }
    });
  }
  logger.log(`====================================================`);
}

await bootstrap();
