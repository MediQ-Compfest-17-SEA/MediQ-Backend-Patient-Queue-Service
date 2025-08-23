import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { Priority, QueueStatus } from './dto/queue.dto';
import { NotFoundException } from '@nestjs/common';

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueService],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToQueue', () => {
    it('adds a patient with default NORMAL priority and WAITING status, increments number and returns response', async () => {
      const res1 = await service.addToQueue({
        nik: '111',
        nama: 'A',
        keterangan: 'first',
      } as any);

      expect(res1.success).toBe(true);
      expect(res1.message).toBe('Patient successfully added to queue');
      expect(res1.data.queueNumber).toBe(1);
      expect(res1.data.status).toBe(QueueStatus.WAITING);
      expect(res1.data.priority).toBe(Priority.NORMAL);
      expect(res1.data.nik).toBe('111');

      const res2 = await service.addToQueue({
        nik: '222',
        nama: 'B',
        keterangan: 'second',
        priority: Priority.HIGH,
      } as any);

      expect(res2.data.queueNumber).toBe(2);
      expect(res2.data.priority).toBe(Priority.HIGH);
    });
  });

  describe('getQueues', () => {
    beforeEach(async () => {
      // seed 3 patients: WAITING (NORMAL), WAITING (HIGH), COMPLETED (LOW)
      await service.addToQueue({ nik: 'A', nama: 'A', priority: Priority.NORMAL } as any);
      await service.addToQueue({ nik: 'B', nama: 'B', priority: Priority.HIGH } as any);
      const resC = await service.addToQueue({ nik: 'C', nama: 'C', priority: Priority.LOW } as any);
      await service.updateQueueStatus(resC.data.id, { status: QueueStatus.COMPLETED } as any);

      // Set createdAt dates to control date filtering
      const q = (service as any).queues as any[];
      q[0].createdAt = '2024-01-20T08:00:00.000Z';
      q[1].createdAt = '2024-01-20T09:00:00.000Z';
      q[2].createdAt = '2024-01-21T10:00:00.000Z';
    });

    it('filters by status', async () => {
      const result = await service.getQueues({ status: QueueStatus.COMPLETED } as any);
      expect(result.data.every((d: any) => d.status === QueueStatus.COMPLETED)).toBe(true);
    });

    it('filters by priority', async () => {
      const result = await service.getQueues({ priority: Priority.HIGH } as any);
      expect(result.data.every((d: any) => d.priority === Priority.HIGH)).toBe(true);
    });

    it('filters by date (YYYY-MM-DD)', async () => {
      const result = await service.getQueues({ date: '2024-01-20' } as any);
      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });

    it('paginates results', async () => {
      // add more items to ensure pagination works
      for (let i = 0; i < 13; i++) {
        await service.addToQueue({ nik: `P${i}`, nama: `P${i}` } as any);
      }
      const resultPg1 = await service.getQueues({ page: 1, limit: 10 } as any);
      const resultPg2 = await service.getQueues({ page: 2, limit: 10 } as any);
      expect(resultPg1.data.length).toBe(10);
      expect(resultPg2.data.length).toBeGreaterThan(0);
      expect(resultPg2.pagination.page).toBe(2);
    });
  });

  describe('getQueueStats', () => {
    it('computes today stats from queues marked for today', async () => {
      // Seed two items for today: one WAITING, one IN_PROGRESS, and one CANCELLED via update
      const r1 = await service.addToQueue({ nik: 'T1', nama: 'Now1' } as any);
      const r2 = await service.addToQueue({ nik: 'T2', nama: 'Now2' } as any);
      await service.updateQueueStatus(r2.data.id, { status: QueueStatus.IN_PROGRESS } as any);
      const r3 = await service.addToQueue({ nik: 'T3', nama: 'Now3' } as any);
      await service.cancelQueue(r3.data.id);

      const stats = await service.getQueueStats();
      expect(stats.totalToday).toBeGreaterThanOrEqual(3);
      expect(stats.waiting).toBeGreaterThanOrEqual(1);
      expect(stats.inProgress).toBeGreaterThanOrEqual(1);
      expect(stats.cancelled).toBeGreaterThanOrEqual(1);
      expect(typeof stats.averageWaitTime).toBe('number');
    });
  });

  describe('getNextInQueue', () => {
    it('returns highest priority waiting, then earliest created', async () => {
      const a = await service.addToQueue({ nik: 'N1', nama: 'N1', priority: Priority.NORMAL } as any);
      const b = await service.addToQueue({ nik: 'N2', nama: 'N2', priority: Priority.HIGH } as any);
      const c = await service.addToQueue({ nik: 'N3', nama: 'N3', priority: Priority.URGENT } as any);

      // manipulate createdAt to ensure ordering within same priority
      const q = (service as any).queues as any[];
      // Put URGENT later, but it should still be chosen
      const qA = q.find((x) => x.id === a.data.id);
      const qB = q.find((x) => x.id === b.data.id);
      const qC = q.find((x) => x.id === c.data.id);
      qA.createdAt = '2024-01-20T08:00:00.000Z';
      qB.createdAt = '2024-01-20T07:00:00.000Z';
      qC.createdAt = '2024-01-20T09:00:00.000Z';

      const next = await service.getNextInQueue();
      expect(next.id).toBe(qC.id); // URGENT wins
    });

    it('throws NotFoundException when no WAITING queues', async () => {
      await expect(service.getNextInQueue()).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getQueueById', () => {
    it('returns queue when found', async () => {
      const res = await service.addToQueue({ nik: 'IDX', nama: 'IDX' } as any);
      const found = await service.getQueueById(res.data.id);
      expect(found.id).toBe(res.data.id);
    });

    it('throws NotFoundException when missing', async () => {
      await expect(service.getQueueById('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateQueueStatus', () => {
    it('updates status and optionally keterangan', async () => {
      const res = await service.addToQueue({ nik: 'U', nama: 'U' } as any);
      const updated = await service.updateQueueStatus(res.data.id, {
        status: QueueStatus.IN_PROGRESS,
        keterangan: 'Serving',
      } as any);
      expect(updated.status).toBe(QueueStatus.IN_PROGRESS);
      expect(updated.keterangan).toBe('Serving');

      // update without keterangan
      const updated2 = await service.updateQueueStatus(res.data.id, {
        status: QueueStatus.COMPLETED,
      } as any);
      expect(updated2.status).toBe(QueueStatus.COMPLETED);
      expect(updated2.keterangan).toBe('Serving');
    });

    it('throws NotFoundException when id not found', async () => {
      await expect(
        service.updateQueueStatus('nope', { status: QueueStatus.CANCELLED } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('cancelQueue', () => {
    it('sets status to CANCELLED and returns success', async () => {
      const res = await service.addToQueue({ nik: 'C', nama: 'C' } as any);
      const result = await service.cancelQueue(res.data.id);
      expect(result).toEqual({ success: true, message: 'Queue cancelled successfully' });
      const q = await service.getQueueById(res.data.id);
      expect(q.status).toBe(QueueStatus.CANCELLED);
    });

    it('throws NotFoundException when id not found', async () => {
      await expect(service.cancelQueue('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getDailyStats', () => {
    it('returns date, stats and hourlyDistribution, counts by hour', async () => {
      // seed with specific hours on a fixed date
      const date = '2024-01-22';
      const r1 = await service.addToQueue({ nik: 'D1', nama: 'D1' } as any);
      const r2 = await service.addToQueue({ nik: 'D2', nama: 'D2' } as any);
      const r3 = await service.addToQueue({ nik: 'D3', nama: 'D3' } as any);

      const q = (service as any).queues as any[];
      // Use local time (no 'Z') to avoid timezone shifts in getHours()
      q.find((x) => x.id === r1.data.id).createdAt = `${date}T00:15:00.000`;
      q.find((x) => x.id === r2.data.id).createdAt = `${date}T00:45:00.000`;
      q.find((x) => x.id === r3.data.id).createdAt = `${date}T10:00:00.000`;

      const daily = await service.getDailyStats(date);
      expect(daily.date).toBe(date);
      expect(Array.isArray(daily.hourlyDistribution)).toBe(true);
      const hour0 = daily.hourlyDistribution.find((h: any) => h.hour === 0);
      const hour10 = daily.hourlyDistribution.find((h: any) => h.hour === 10);
      expect(hour0).toBeDefined();
      expect(hour10).toBeDefined();
      expect(hour0!.count).toBe(2);
      expect(hour10!.count).toBe(1);
    });

    it('defaults to today when no date provided', async () => {
      const res = await service.getDailyStats();
      expect(typeof res.date).toBe('string');
      expect(Array.isArray(res.hourlyDistribution)).toBe(true);
    });
  });

  describe('getWeeklyStats', () => {
    it('returns mock weekly stats structure', async () => {
      const weekly = await service.getWeeklyStats();
      expect(weekly).toEqual({ weeklyData: [], totalWeekly: 0 });
    });
  });
});
