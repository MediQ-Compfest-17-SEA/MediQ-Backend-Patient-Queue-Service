import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { QueueService } from './queue.service';
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

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  @ApiOperation({
    summary: 'Add patient to queue',
    description: 'Register a new patient and add them to the medical facility queue',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Patient successfully added to queue',
    type: CreateQueueResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid patient data or validation errors',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['nik should not be empty', 'nama should not be empty'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Database error or service unavailable',
  })
  async addToQueue(@Body() createQueueDto: CreatePatientQueueDto): Promise<CreateQueueResponseDto> {
    return await this.queueService.addToQueue(createQueueDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all queues',
    description: 'Retrieve all patient queues with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: QueueStatus,
    description: 'Filter by queue status',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: Priority,
    description: 'Filter by priority',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by date (YYYY-MM-DD format)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of patient queues retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/QueueDto' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 45 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  async getQueues(@Query() query: GetQueuesQueryDto) {
    return await this.queueService.getQueues(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get queue statistics',
    description: 'Retrieve statistics and analytics about today queue performance',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Queue statistics retrieved successfully',
    type: QueueStatsDto,
  })
  async getQueueStats(): Promise<QueueStatsDto> {
    return await this.queueService.getQueueStats();
  }

  @Get('next')
  @ApiOperation({
    summary: 'Get next patient in queue',
    description: 'Retrieve the next patient waiting to be served based on priority and queue order',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Next patient in queue retrieved successfully',
    type: QueueDto,
  })
  @ApiNotFoundResponse({
    description: 'No patients waiting in queue',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'No patients in queue' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async getNextInQueue(): Promise<QueueDto> {
    return await this.queueService.getNextInQueue();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get queue by ID',
    description: 'Retrieve specific patient queue information by queue ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Queue ID',
    example: 'PQ-20240120-001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Queue information retrieved successfully',
    type: QueueDto,
  })
  @ApiNotFoundResponse({
    description: 'Queue not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Queue not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async getQueueById(@Param('id') id: string): Promise<QueueDto> {
    return await this.queueService.getQueueById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update queue status',
    description: 'Update the status of a patient queue (e.g., from waiting to in-progress)',
  })
  @ApiParam({
    name: 'id',
    description: 'Queue ID',
    example: 'PQ-20240120-001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Queue status updated successfully',
    type: QueueDto,
  })
  @ApiNotFoundResponse({
    description: 'Queue not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid status or validation errors',
  })
  async updateQueueStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateQueueStatusDto,
  ): Promise<QueueDto> {
    return await this.queueService.updateQueueStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel queue',
    description: 'Cancel a patient queue entry (sets status to CANCELLED)',
  })
  @ApiParam({
    name: 'id',
    description: 'Queue ID',
    example: 'PQ-20240120-001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Queue cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Queue cancelled successfully' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Queue not found',
  })
  async cancelQueue(@Param('id') id: string) {
    return await this.queueService.cancelQueue(id);
  }
}

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly queueService: QueueService) {}

  @Get('daily')
  @ApiOperation({
    summary: 'Get daily queue statistics',
    description: 'Retrieve detailed daily statistics for queue performance analysis',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Specific date for statistics (YYYY-MM-DD), defaults to today',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daily statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        date: { type: 'string', example: '2024-01-20' },
        stats: { $ref: '#/components/schemas/QueueStatsDto' },
        hourlyDistribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              hour: { type: 'number', example: 9 },
              count: { type: 'number', example: 5 },
            },
          },
        },
      },
    },
  })
  async getDailyStats(@Query('date') date?: string) {
    return await this.queueService.getDailyStats(date);
  }

  @Get('weekly')
  @ApiOperation({
    summary: 'Get weekly queue statistics',
    description: 'Retrieve weekly statistics for trend analysis',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Weekly statistics retrieved successfully',
  })
  async getWeeklyStats() {
    return await this.queueService.getWeeklyStats();
  }
}
