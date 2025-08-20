import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export enum QueueStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreatePatientQueueDto {
  @ApiProperty({
    description: 'Nomor Induk Kependudukan (NIK) pasien',
    example: '3171012345678901',
    minLength: 16,
    maxLength: 16,
  })
  @IsString()
  @IsNotEmpty()
  nik: string;

  @ApiProperty({
    description: 'Nama lengkap pasien',
    example: 'John Doe Smith',
  })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({
    description: 'Tempat lahir pasien',
    example: 'Jakarta',
  })
  @IsString()
  @IsNotEmpty()
  tempat_lahir: string;

  @ApiProperty({
    description: 'Tanggal lahir pasien dalam format DD-MM-YYYY',
    example: '15-08-1990',
  })
  @IsString()
  @IsNotEmpty()
  tgl_lahir: string;

  @ApiProperty({
    description: 'Jenis kelamin pasien',
    example: 'LAKI-LAKI',
    enum: ['LAKI-LAKI', 'PEREMPUAN'],
  })
  @IsString()
  @IsNotEmpty()
  jenis_kelamin: string;

  @ApiProperty({
    description: 'Alamat lengkap pasien',
    example: 'Jl. Menteng Raya No. 123, RT/RW 001/002, Kelurahan Menteng',
  })
  @IsString()
  @IsNotEmpty()
  alamat: string;

  @ApiProperty({
    description: 'Agama pasien',
    example: 'Islam',
  })
  @IsString()
  @IsNotEmpty()
  agama: string;

  @ApiPropertyOptional({
    description: 'Prioritas antrian',
    example: Priority.NORMAL,
    enum: Priority,
    default: Priority.NORMAL,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Keterangan tambahan atau keluhan pasien',
    example: 'Pasien mengeluh demam tinggi dan sakit kepala',
  })
  @IsOptional()
  @IsString()
  keterangan?: string;
}

export class UpdateQueueStatusDto {
  @ApiProperty({
    description: 'Status antrian pasien',
    example: QueueStatus.IN_PROGRESS,
    enum: QueueStatus,
  })
  @IsEnum(QueueStatus)
  @IsNotEmpty()
  status: QueueStatus;

  @ApiPropertyOptional({
    description: 'Keterangan perubahan status',
    example: 'Pasien sedang diperiksa oleh dokter',
  })
  @IsOptional()
  @IsString()
  keterangan?: string;
}

export class QueueDto {
  @ApiProperty({
    description: 'ID unik antrian',
    example: 'PQ-20240120-001',
  })
  id: string;

  @ApiProperty({
    description: 'Nomor antrian',
    example: 1,
  })
  queueNumber: number;

  @ApiProperty({
    description: 'NIK pasien',
    example: '3171012345678901',
  })
  nik: string;

  @ApiProperty({
    description: 'Nama pasien',
    example: 'John Doe Smith',
  })
  nama: string;

  @ApiProperty({
    description: 'Status antrian',
    example: QueueStatus.WAITING,
    enum: QueueStatus,
  })
  status: QueueStatus;

  @ApiProperty({
    description: 'Prioritas antrian',
    example: Priority.NORMAL,
    enum: Priority,
  })
  priority: Priority;

  @ApiProperty({
    description: 'Waktu pendaftaran',
    example: '2024-01-20T10:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Estimasi waktu tunggu dalam menit',
    example: 30,
  })
  estimatedWaitTime: number;

  @ApiPropertyOptional({
    description: 'Keterangan',
    example: 'Pasien prioritas tinggi',
  })
  keterangan?: string;
}

export class QueueStatsDto {
  @ApiProperty({
    description: 'Total antrian hari ini',
    example: 45,
  })
  totalToday: number;

  @ApiProperty({
    description: 'Antrian sedang menunggu',
    example: 12,
  })
  waiting: number;

  @ApiProperty({
    description: 'Antrian sedang dilayani',
    example: 3,
  })
  inProgress: number;

  @ApiProperty({
    description: 'Antrian selesai',
    example: 28,
  })
  completed: number;

  @ApiProperty({
    description: 'Antrian dibatalkan',
    example: 2,
  })
  cancelled: number;

  @ApiProperty({
    description: 'Rata-rata waktu tunggu dalam menit',
    example: 25,
  })
  averageWaitTime: number;
}

export class CreateQueueResponseDto {
  @ApiProperty({
    description: 'Status keberhasilan operasi',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Pesan response',
    example: 'Patient successfully added to queue',
  })
  message: string;

  @ApiProperty({
    description: 'Data antrian yang dibuat',
    type: QueueDto,
  })
  data: QueueDto;
}

export class GetQueuesQueryDto {
  @ApiPropertyOptional({
    description: 'Status antrian untuk filter',
    enum: QueueStatus,
    example: QueueStatus.WAITING,
  })
  @IsOptional()
  @IsEnum(QueueStatus)
  status?: QueueStatus;

  @ApiPropertyOptional({
    description: 'Prioritas untuk filter',
    enum: Priority,
    example: Priority.NORMAL,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Tanggal untuk filter (YYYY-MM-DD)',
    example: '2024-01-20',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Halaman untuk pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Jumlah data per halaman',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
