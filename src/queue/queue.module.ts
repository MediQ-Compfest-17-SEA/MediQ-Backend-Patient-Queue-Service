import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController, StatsController } from './queue.controller';
import { QueueGrpcController } from './queue.grpc.controller';

@Module({
  providers: [QueueService],
  controllers: [QueueController, StatsController, QueueGrpcController]
})
export class QueueModule {}
