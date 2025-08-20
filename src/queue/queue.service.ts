import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePatientQueueDto,
  UpdateQueueStatusDto,
  QueueDto,
  QueueStatsDto,
  CreateQueueResponseDto,
  GetQueuesQueryDto,
  QueueStatus,
  Priority,
} from './dto/queue.dto';

@Injectable()
export class QueueService {
  // Mock implementation for demonstration - replace with actual database operations
  private queues: QueueDto[] = [];
  private queueCounter = 1;

  async addToQueue(createQueueDto: CreatePatientQueueDto): Promise<CreateQueueResponseDto> {
    const queueId = `PQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.queueCounter).padStart(3, '0')}`;
    
    const newQueue: QueueDto = {
      id: queueId,
      queueNumber: this.queueCounter++,
      nik: createQueueDto.nik,
      nama: createQueueDto.nama,
      status: QueueStatus.WAITING,
      priority: createQueueDto.priority || Priority.NORMAL,
      createdAt: new Date().toISOString(),
      estimatedWaitTime: this.calculateEstimatedWaitTime(),
      keterangan: createQueueDto.keterangan,
    };

    this.queues.push(newQueue);

    return {
      success: true,
      message: 'Patient successfully added to queue',
      data: newQueue,
    };
  }

  async getQueues(query: GetQueuesQueryDto) {
    let filteredQueues = [...this.queues];

    if (query.status) {
      filteredQueues = filteredQueues.filter(q => q.status === query.status);
    }
    if (query.priority) {
      filteredQueues = filteredQueues.filter(q => q.priority === query.priority);
    }
    if (query.date) {
      filteredQueues = filteredQueues.filter(q => 
        q.createdAt.startsWith(query.date!)
      );
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    
    const paginatedQueues = filteredQueues.slice(skip, skip + limit);
    
    return {
      data: paginatedQueues,
      pagination: {
        page,
        limit,
        total: filteredQueues.length,
        totalPages: Math.ceil(filteredQueues.length / limit),
      },
    };
  }

  async getQueueStats(): Promise<QueueStatsDto> {
    const today = new Date().toISOString().slice(0, 10);
    const todayQueues = this.queues.filter(q => q.createdAt.startsWith(today));

    return {
      totalToday: todayQueues.length,
      waiting: todayQueues.filter(q => q.status === QueueStatus.WAITING).length,
      inProgress: todayQueues.filter(q => q.status === QueueStatus.IN_PROGRESS).length,
      completed: todayQueues.filter(q => q.status === QueueStatus.COMPLETED).length,
      cancelled: todayQueues.filter(q => q.status === QueueStatus.CANCELLED).length,
      averageWaitTime: 25, // Mock value
    };
  }

  async getNextInQueue(): Promise<QueueDto> {
    const waitingQueues = this.queues.filter(q => q.status === QueueStatus.WAITING);
    
    if (waitingQueues.length === 0) {
      throw new NotFoundException('No patients in queue');
    }

    // Sort by priority and creation time
    waitingQueues.sort((a, b) => {
      const priorityOrder = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return waitingQueues[0];
  }

  async getQueueById(id: string): Promise<QueueDto> {
    const queue = this.queues.find(q => q.id === id);
    if (!queue) {
      throw new NotFoundException('Queue not found');
    }
    return queue;
  }

  async updateQueueStatus(id: string, updateStatusDto: UpdateQueueStatusDto): Promise<QueueDto> {
    const queueIndex = this.queues.findIndex(q => q.id === id);
    if (queueIndex === -1) {
      throw new NotFoundException('Queue not found');
    }

    this.queues[queueIndex].status = updateStatusDto.status;
    if (updateStatusDto.keterangan) {
      this.queues[queueIndex].keterangan = updateStatusDto.keterangan;
    }

    return this.queues[queueIndex];
  }

  async cancelQueue(id: string) {
    const queueIndex = this.queues.findIndex(q => q.id === id);
    if (queueIndex === -1) {
      throw new NotFoundException('Queue not found');
    }

    this.queues[queueIndex].status = QueueStatus.CANCELLED;

    return {
      success: true,
      message: 'Queue cancelled successfully',
    };
  }

  async getDailyStats(date?: string) {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const dailyQueues = this.queues.filter(q => q.createdAt.startsWith(targetDate));

    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: dailyQueues.filter(q => 
        new Date(q.createdAt).getHours() === hour
      ).length,
    }));

    return {
      date: targetDate,
      stats: await this.getQueueStats(),
      hourlyDistribution,
    };
  }

  async getWeeklyStats() {
    // Mock implementation
    return {
      weeklyData: [],
      totalWeekly: 0,
    };
  }

  private calculateEstimatedWaitTime(): number {
    const waitingQueues = this.queues.filter(q => q.status === QueueStatus.WAITING);
    return waitingQueues.length * 15; // 15 minutes per patient estimate
  }
}
