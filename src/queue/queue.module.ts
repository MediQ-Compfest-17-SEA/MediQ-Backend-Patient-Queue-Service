import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController, StatsController } from './queue.controller';

@Module({
  providers: [QueueService],
  controllers: [QueueController, StatsController]
})
export class QueueModule {}
