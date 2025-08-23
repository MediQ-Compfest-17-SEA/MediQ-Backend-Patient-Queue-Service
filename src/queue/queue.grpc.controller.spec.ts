import { Test, TestingModule } from '@nestjs/testing';
import { QueueGrpcController } from './queue.grpc.controller';
import { QueueService } from './queue.service';
import { Priority } from './dto/queue.dto';

describe('QueueGrpcController', () => {
  let controller: QueueGrpcController;
  const mockQueueService = {
    addToQueue: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueGrpcController],
      providers: [{ provide: QueueService, useValue: mockQueueService }],
    }).compile();

    controller = module.get(QueueGrpcController);
  });

  it('maps and normalizes request, supports lower-cased priority, returns success with dataJson', async () => {
    const mockResult = {
      success: true,
      message: 'Patient successfully added to queue',
      data: { id: 'PQ-1', priority: Priority.URGENT },
    };
    mockQueueService.addToQueue.mockResolvedValue(mockResult);

    const req = {
      nik: '123',
      nama: 'John',
      priority: 'urgent', // lower-cased, should map to Priority.URGENT
      alamat: '',
      agama: '',
    };

    const res = await controller.addToQueue(req as any);

    expect(res.success).toBe(true);
    expect(res.error).toBe('');
    expect(typeof res.dataJson).toBe('string');
    const parsed = JSON.parse(res.dataJson!);
    expect(parsed.id).toBe('PQ-1');

    // assert mapping passed to service
    expect(mockQueueService.addToQueue).toHaveBeenCalledTimes(1);
    const arg = mockQueueService.addToQueue.mock.calls[0][0];
    expect(arg.nik).toBe('123');
    expect(arg.nama).toBe('John');
    expect(arg.priority).toBe(Priority.URGENT);
    expect(arg.alamat).toBe('-'); // normalized fallback
    expect(arg.agama).toBe('-');  // normalized fallback
  });

  it('returns error response when service throws', async () => {
    mockQueueService.addToQueue.mockRejectedValue(new Error('boom'));
    const res = await controller.addToQueue({ nik: '1', nama: 'X' } as any);
    expect(res.success).toBe(false);
    expect(res.error).toBe('boom');
  });
});
describe('QueueGrpcController additional branches', () => {
  let controller: QueueGrpcController;
  const mockQueueService = {
    addToQueue: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueGrpcController],
      providers: [{ provide: QueueService, useValue: mockQueueService }],
    }).compile();

    controller = module.get(QueueGrpcController);
  });

  it('sets priority to undefined when not provided', async () => {
    mockQueueService.addToQueue.mockResolvedValue({
      success: true,
      data: { id: 'PQ-2' },
    });

    const req = { nik: '123', nama: 'NoPrio' };
    await controller.addToQueue(req as any);
    const arg = mockQueueService.addToQueue.mock.calls[0][0];
    expect(arg.priority).toBeUndefined();
  });

  it('sets priority to undefined when provided unknown value', async () => {
    mockQueueService.addToQueue.mockResolvedValue({
      success: true,
      data: { id: 'PQ-3' },
    });

    const req = { nik: '123', nama: 'UnknownPrio', priority: 'foo' };
    await controller.addToQueue(req as any);
    const arg = mockQueueService.addToQueue.mock.calls[0][0];
    expect(arg.priority).toBeUndefined();
  });

  it('uses provided non-empty fields without fallback replacement', async () => {
    mockQueueService.addToQueue.mockResolvedValue({
      success: true,
      data: { id: 'PQ-4' },
    });

    const req = { nik: '999', nama: 'Keep', alamat: 'JL', agama: 'A' };
    await controller.addToQueue(req as any);
    const arg = mockQueueService.addToQueue.mock.calls[0][0];
    expect(arg.alamat).toBe('JL');
    expect(arg.agama).toBe('A');
  });

  it('falls back to default message when service does not provide message', async () => {
    mockQueueService.addToQueue.mockResolvedValue({
      success: true,
      data: { id: 'PQ-5' },
      message: undefined,
    });

    const res = await controller.addToQueue({ nik: '1', nama: 'X' } as any);
    expect(res.message).toBe('Patient successfully added to queue');
  });
});