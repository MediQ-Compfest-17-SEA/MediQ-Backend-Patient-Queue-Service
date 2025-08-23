import { Test, TestingModule } from '@nestjs/testing';
import { QueueController, StatsController } from './queue.controller';
import { QueueService } from './queue.service';
import { CreatePatientQueueDto, UpdateQueueStatusDto, QueueStatus, Priority } from './dto/queue.dto';

describe('QueueController', () => {
  let controller: QueueController;
  let service: QueueService;

  const mockQueueService = {
    addToQueue: jest.fn(),
    getQueues: jest.fn(),
    getQueueStats: jest.fn(),
    getNextInQueue: jest.fn(),
    getQueueById: jest.fn(),
    updateQueueStatus: jest.fn(),
    cancelQueue: jest.fn(),
    getDailyStats: jest.fn(),
    getWeeklyStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
      ],
    }).compile();

    controller = module.get<QueueController>(QueueController);
    service = module.get<QueueService>(QueueService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addToQueue', () => {
    it('should add patient to queue successfully', async () => {
      const createQueueDto: any = {
        nik: '3171012345678901',
        nama: 'John Doe',
        tempat_lahir: 'Jakarta',
        tgl_lahir: '1990-01-01',
        jenis_kelamin: 'LAKI-LAKI',
        alamat: 'Jl. Test No. 123',
        agama: 'Islam',
        priority: Priority.NORMAL,
        keterangan: 'Kontrol rutin',
      } as any;

      const mockResult = {
        success: true,
        message: 'Patient successfully added to queue',
        data: {
          id: 'PQ-20240120-001',
          queueNumber: 1,
          nik: '3171012345678901',
          nama: 'John Doe',
          status: QueueStatus.WAITING,
          priority: Priority.NORMAL,
          createdAt: new Date().toISOString(),
          estimatedWaitTime: 15,
          keterangan: 'Kontrol rutin',
        },
      };

      mockQueueService.addToQueue.mockResolvedValue(mockResult);

      const result = await controller.addToQueue(createQueueDto);

      expect(result).toEqual(mockResult);
      expect(mockQueueService.addToQueue).toHaveBeenCalledWith(createQueueDto);
      expect(mockQueueService.addToQueue).toHaveBeenCalledTimes(1);
    });
  });

  describe('getQueues', () => {
    it('should get all queues with pagination', async () => {
      const query = { page: 1, limit: 10 };
      const mockResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockQueueService.getQueues.mockResolvedValue(mockResult);

      const result = await controller.getQueues(query);

      expect(result).toEqual(mockResult);
      expect(mockQueueService.getQueues).toHaveBeenCalledWith(query);
    });

    it('should get queues with filters', async () => {
      const query = { 
        status: QueueStatus.WAITING, 
        priority: Priority.HIGH,
        date: '2024-01-20',
        page: 1,
        limit: 10 
      };

      mockQueueService.getQueues.mockResolvedValue({ data: [], pagination: {} });

      await controller.getQueues(query);

      expect(mockQueueService.getQueues).toHaveBeenCalledWith(query);
    });
  });

  describe('getQueueStats', () => {
    it('should get queue statistics', async () => {
      const mockStats = {
        totalToday: 45,
        waiting: 12,
        inProgress: 3,
        completed: 28,
        cancelled: 2,
        averageWaitTime: 25,
      };

      mockQueueService.getQueueStats.mockResolvedValue(mockStats);

      const result = await controller.getQueueStats();

      expect(result).toEqual(mockStats);
      expect(mockQueueService.getQueueStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('getNextInQueue', () => {
    it('should get next patient in queue', async () => {
      const mockQueue = {
        id: 'PQ-20240120-001',
        queueNumber: 1,
        nik: '3171012345678901',
        nama: 'John Doe',
        status: QueueStatus.WAITING,
        priority: Priority.URGENT,
        createdAt: new Date().toISOString(),
        estimatedWaitTime: 0,
        keterangan: 'Emergency',
      };

      mockQueueService.getNextInQueue.mockResolvedValue(mockQueue);

      const result = await controller.getNextInQueue();

      expect(result).toEqual(mockQueue);
      expect(mockQueueService.getNextInQueue).toHaveBeenCalledTimes(1);
    });
  });

  describe('getQueueById', () => {
    it('should get queue by ID', async () => {
      const queueId = 'PQ-20240120-001';
      const mockQueue = {
        id: queueId,
        queueNumber: 1,
        nik: '3171012345678901',
        nama: 'John Doe',
        status: QueueStatus.WAITING,
        priority: Priority.NORMAL,
        createdAt: new Date().toISOString(),
        estimatedWaitTime: 15,
        keterangan: 'Kontrol rutin',
      };

      mockQueueService.getQueueById.mockResolvedValue(mockQueue);

      const result = await controller.getQueueById(queueId);

      expect(result).toEqual(mockQueue);
      expect(mockQueueService.getQueueById).toHaveBeenCalledWith(queueId);
    });
  });

  describe('updateQueueStatus', () => {
    it('should update queue status', async () => {
      const queueId = 'PQ-20240120-001';
      const updateDto: UpdateQueueStatusDto = {
        status: QueueStatus.IN_PROGRESS,
        keterangan: 'Sedang dilayani',
      };

      const mockUpdatedQueue = {
        id: queueId,
        queueNumber: 1,
        nik: '3171012345678901',
        nama: 'John Doe',
        status: QueueStatus.IN_PROGRESS,
        priority: Priority.NORMAL,
        createdAt: new Date().toISOString(),
        estimatedWaitTime: 0,
        keterangan: 'Sedang dilayani',
      };

      mockQueueService.updateQueueStatus.mockResolvedValue(mockUpdatedQueue);

      const result = await controller.updateQueueStatus(queueId, updateDto);

      expect(result).toEqual(mockUpdatedQueue);
      expect(mockQueueService.updateQueueStatus).toHaveBeenCalledWith(queueId, updateDto);
    });
  });

  describe('cancelQueue', () => {
    it('should cancel queue', async () => {
      const queueId = 'PQ-20240120-001';
      const mockResult = {
        success: true,
        message: 'Queue cancelled successfully',
      };

      mockQueueService.cancelQueue.mockResolvedValue(mockResult);

      const result = await controller.cancelQueue(queueId);

      expect(result).toEqual(mockResult);
      expect(mockQueueService.cancelQueue).toHaveBeenCalledWith(queueId);
    });

    it('should propagate NotFoundException when cancel fails', async () => {
      const queueId = 'missing-id';
      mockQueueService.cancelQueue.mockRejectedValue(new (require('@nestjs/common').NotFoundException)('Queue not found'));
      await expect(controller.cancelQueue(queueId)).rejects.toBeInstanceOf(require('@nestjs/common').NotFoundException);
    });
  });

  describe('negative branches (NotFound from service)', () => {
    it('getNextInQueue propagates NotFoundException', async () => {
      mockQueueService.getNextInQueue.mockRejectedValue(new (require('@nestjs/common').NotFoundException)('No patients in queue'));
      await expect(controller.getNextInQueue()).rejects.toBeInstanceOf(require('@nestjs/common').NotFoundException);
    });

    it('getQueueById propagates NotFoundException', async () => {
      mockQueueService.getQueueById.mockRejectedValue(new (require('@nestjs/common').NotFoundException)('Queue not found'));
      await expect(controller.getQueueById('missing')).rejects.toBeInstanceOf(require('@nestjs/common').NotFoundException);
    });

    it('updateQueueStatus propagates NotFoundException', async () => {
      mockQueueService.updateQueueStatus.mockRejectedValue(new (require('@nestjs/common').NotFoundException)('Queue not found'));
      await expect(controller.updateQueueStatus('missing', { status: require('./dto/queue.dto').QueueStatus.CANCELLED } as any))
        .rejects.toBeInstanceOf(require('@nestjs/common').NotFoundException);
    });
  });
});

describe('StatsController', () => {
  let controller: StatsController;
  let service: QueueService;

  const mockQueueService = {
    getDailyStats: jest.fn(),
    getWeeklyStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    service = module.get<QueueService>(QueueService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDailyStats', () => {
    it('should get daily statistics', async () => {
      const date = '2024-01-20';
      const mockStats = {
        date,
        stats: {
          totalToday: 45,
          waiting: 12,
          inProgress: 3,
          completed: 28,
          cancelled: 2,
          averageWaitTime: 25,
        },
        hourlyDistribution: [],
      };

      mockQueueService.getDailyStats.mockResolvedValue(mockStats);

      const result = await controller.getDailyStats(date);

      expect(result).toEqual(mockStats);
      expect(mockQueueService.getDailyStats).toHaveBeenCalledWith(date);
    });

    it('should get daily statistics without date parameter', async () => {
      const mockStats = {
        date: new Date().toISOString().slice(0, 10),
        stats: {
          totalToday: 45,
          waiting: 12,
          inProgress: 3,
          completed: 28,
          cancelled: 2,
          averageWaitTime: 25,
        },
        hourlyDistribution: [],
      };

      mockQueueService.getDailyStats.mockResolvedValue(mockStats);

      const result = await controller.getDailyStats();

      expect(result).toEqual(mockStats);
      expect(mockQueueService.getDailyStats).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getWeeklyStats', () => {
    it('should get weekly statistics', async () => {
      const mockStats = {
        weeklyData: [],
        totalWeekly: 0,
      };

      mockQueueService.getWeeklyStats.mockResolvedValue(mockStats);

      const result = await controller.getWeeklyStats();

      expect(result).toEqual(mockStats);
      expect(mockQueueService.getWeeklyStats).toHaveBeenCalledTimes(1);
    });
  });
});
