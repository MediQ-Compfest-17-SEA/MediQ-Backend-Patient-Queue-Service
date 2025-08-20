import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('MediQ Patient Queue Service API')
    .setDescription(
      'API for managing patient queues in medical facilities. Handles patient registration, queue management, and queue status tracking with Redis caching.',
    )
    .setVersion('1.0')
    .addTag('Queue', 'Patient queue management endpoints')
    .addTag('Stats', 'Queue statistics and analytics endpoints')
    .addServer(`http://localhost:${process.env.PORT || 3003}`, 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3003;
  await app.listen(port);

  console.log(`Patient Queue service is listening on port ${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
