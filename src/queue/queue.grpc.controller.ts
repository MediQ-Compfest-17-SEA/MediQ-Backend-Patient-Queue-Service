import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QueueService } from './queue.service';
import { Priority } from './dto/queue.dto';

type AddToQueueRequest = {
  nik: string;
  nama: string;
  tempat_lahir?: string;
  tgl_lahir?: string;
  jenis_kelamin?: string;
  alamat?: string;
  agama?: string;
  priority?: string;
  keterangan?: string;
  institutionId?: string; // currently ignored in mock service, reserved for future scoping
};

type AddToQueueResponse = {
  success: boolean;
  message?: string;
  dataJson?: string;
  error?: string;
};

@Controller()
export class QueueGrpcController {
  constructor(private readonly queueService: QueueService) {}

  // queue.v1.QueueService/AddToQueue
  @GrpcMethod('QueueService', 'AddToQueue')
  async addToQueue(data: AddToQueueRequest): Promise<AddToQueueResponse> {
    try {
      // Normalize and map priority if provided
      const prio = (data.priority || '').toUpperCase();
      const priorityEnum = prio in Priority ? (prio as keyof typeof Priority) : undefined;

      const createDto = {
        nik: String(data.nik || ''),
        nama: String(data.nama || ''),
        tempat_lahir: String(data.tempat_lahir || ''),
        tgl_lahir: String(data.tgl_lahir || ''),
        jenis_kelamin: String(data.jenis_kelamin || ''),
        alamat: String(data.alamat || '-'),
        agama: String(data.agama || '-'),
        priority: priorityEnum ? Priority[priorityEnum] : undefined,
        keterangan: data.keterangan,
      };

      const result = await this.queueService.addToQueue(createDto as any);

      return {
        success: true,
        message: result?.message || 'Patient successfully added to queue',
        dataJson: JSON.stringify(result?.data ?? {}),
        error: '',
      };
    } catch (e: any) {
      return {
        success: false,
        message: '',
        dataJson: '',
        error: e?.message || 'queue_add_failed',
      };
    }
  }
}