import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

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
      'Advanced mikroservice untuk manajemen antrian pasien dengan Redis caching, real-time WebSocket updates, dan intelligent queue management. Terintegrasi dengan notification system untuk live queue status updates.',
    )
    .setVersion('3.0')
    .addTag('Queue', 'Queue management endpoints - Add, update, call patients dengan real-time notifications')
    .addTag('Stats', 'Queue statistics dan analytics - Wait times, queue metrics, institutional analytics')
    .addTag('health', 'Health check dan monitoring - Service status, Redis connectivity')
    .addBearerAuth()
    .setContact(
      'MediQ Support',
      'https://mediq.craftthingy.com',
      'support@mediq.com'
    )
    .setLicense(
      'MIT',
      'https://opensource.org/licenses/MIT'
    )
    .addServer(`http://localhost:${process.env.PORT || 8605}`, 'Development Server')
    .addServer('https://mediq-patient-queue-service.craftthingy.com', 'Production Server')
    .setExternalDoc('MediQ Documentation', 'https://mediq.craftthingy.com/docs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // gRPC microservice (internal)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'queue.v1',
      protoPath: join(__dirname, '../shared/proto/queue.proto'),
      url: process.env.QUEUE_GRPC_URL || '0.0.0.0:51055',
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT ?? 8605;
  await app.listen(port);

  console.log(`Patient Queue service is listening on port ${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
  console.log(`gRPC server listening at ${process.env.QUEUE_GRPC_URL || '0.0.0.0:51055'}`);
}
bootstrap();
