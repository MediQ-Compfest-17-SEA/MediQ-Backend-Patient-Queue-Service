# MediQ Backend - Patient Queue Service v3.0

## 📋 Deskripsi

Layanan **Patient Queue Service** adalah bagian dari sistem MediQ yang mengelola sistem antrian pasien digital untuk fasilitas kesehatan. Service ini menggantikan sistem antrian konvensional dengan sistem digital yang cerdas dengan prioritas otomatis, estimasi waktu tunggu, dan **real-time WebSocket integration** untuk pembaruan antrian langsung.

## ✨ Fitur Utama

### 🏥 Manajemen Antrian Digital
- **Sistem Prioritas**: URGENT → HIGH → NORMAL → LOW
- **Estimasi Waktu Tunggu**: Otomatis berdasarkan posisi antrian (15 menit per pasien)
- **Status Antrian**: WAITING → IN_PROGRESS → COMPLETED/CANCELLED
- **Nomor Antrian**: Format PQ-YYYYMMDD-XXX (contoh: PQ-20240120-001)
- **🆕 Intelligent Position Tracking**: Real-time queue position updates

### 🔌 Real-time WebSocket Integration
- **Live Queue Updates**: Real-time queue status changes
- **API Gateway Integration**: Centralized WebSocket management
- **Auto Reconnection**: Robust connection handling
- **Queue Position Tracking**: Live position updates for patients
- **Real-time Notifications**: Instant alerts for queue changes

### 🔔 Enhanced Notification System
- **QUEUE_POSITION_CHANGED**: Posisi antrian berubah
- **PATIENT_CALLED**: Pasien dipanggil untuk dilayani
- **QUEUE_STATUS_UPDATED**: Status antrian diperbarui
- **ESTIMATED_TIME_CHANGED**: Estimasi waktu tunggu berubah
- **QUEUE_CANCELLED**: Antrian dibatalkan/dihapus

### 📊 Analytics & Statistik
- **Statistik Harian**: Total pasien, rata-rata waktu tunggu, distribusi per jam
- **Laporan Real-time**: Monitoring antrian yang sedang berlangsung
- **Dashboard Analytics**: Trend mingguan dan monthly untuk management
- **🆕 Real-time Queue Metrics**: Live analytics dashboard

### 🔄 Integrasi Microservices
- **RabbitMQ Communication**: Komunikasi dengan OCR Service untuk pendaftaran otomatis
- **🆕 Enhanced Redis Caching**: High-performance real-time data caching
- **MySQL Database**: Penyimpanan persisten untuk histori dan analytics
- **🆕 WebSocket Gateway Integration**: Real-time communication layer

## 🚀 Quick Start

### Persyaratan
- **Node.js** 18+ 
- **MySQL** 8.0+
- **Redis** 6.0+
- **RabbitMQ** 3.9+

### Instalasi

```bash
# Clone repository
git clone https://github.com/MediQ-Compfest-17-SEA/MediQ-Backend-Patient-Queue-Service.git
cd MediQ-Backend-Patient-Queue-Service

# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma generate

# Setup environment variables
cp .env.example .env
# Edit .env sesuai konfigurasi environment Anda

# Start development server
npm run start:dev
```

### Environment Variables

```env
# Server Configuration
PORT=8605
NODE_ENV=development

# Database
DATABASE_URL="mysql://username:password@localhost:3306/mediq_queue"

# Enhanced Redis Cache Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_TTL=3600
REDIS_QUEUE_TTL=1800  # Real-time queue cache TTL
REDIS_NOTIFICATION_TTL=300  # Notification cache TTL

# RabbitMQ
RABBITMQ_URL="amqp://localhost:5672"

# WebSocket Configuration (NEW)
WEBSOCKET_PORT=8606
WEBSOCKET_PATH=/socket.io
API_GATEWAY_URL=http://localhost:8601

# Logging
LOG_LEVEL=info
```

## 📋 API Endpoints

### Base URL
**Development**: `http://localhost:8605`  
**Production**: `https://api.mediq.com`

### WebSocket Endpoint (NEW)
**Development**: `ws://localhost:8605/socket.io`  
**Production**: `wss://api.mediq.com/socket.io`

### Swagger Documentation
**Interactive API Docs**: `http://localhost:8605/api/docs`

### Core Endpoints

#### 🏥 Queue Management

**Tambah Pasien ke Antrian**
```http
POST /queue
Content-Type: application/json

{
  "nik": "3171012345678901",
  "nama": "John Doe",
  "tempatLahir": "Jakarta", 
  "tanggalLahir": "1990-01-01",
  "jenisKelamin": "Laki-laki",
  "alamat": "Jl. Sehat No. 123",
  "agama": "Islam",
  "statusPerkawinan": "Belum Kawin",
  "pekerjaan": "Software Engineer",
  "kewarganegaraan": "WNI",
  "berlakuHingga": "2025-01-01",
  "priority": "NORMAL",
  "keterangan": "Kontrol rutin"
}
```

**Lihat Semua Antrian**
```http
GET /queue?page=1&limit=10&status=WAITING&priority=HIGH&date=2024-01-20
```

**Get Real-time Queue Position (NEW)**
```http
GET /queue/position/{queueId}
```

**Subscribe to Queue Updates (NEW)**
```http
POST /queue/{queueId}/subscribe
```

**Panggil Pasien Berikutnya**
```http
GET /queue/next
```

**Update Status Antrian**
```http
PATCH /queue/{queueId}/status
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "keterangan": "Sedang dilayani di Poli Umum"
}
```

#### 🔔 Notification Endpoints (NEW)

**Get Notifications for Queue**
```http
GET /notifications/{queueId}
```

**Mark Notification as Read**
```http
PATCH /notifications/{notificationId}/read
```

**Get All Active Notifications**
```http
GET /notifications/active
```

#### 📊 Statistics & Analytics

**Statistik Antrian Hari Ini**
```http
GET /queue/stats
```

**Real-time Queue Metrics (NEW)**
```http
GET /queue/metrics/realtime
```

**Laporan Harian**
```http
GET /stats/daily?date=2024-01-20
```

**Trend Mingguan**
```http
GET /stats/weekly
```

## 🔌 WebSocket Events

### Client → Server Events

**Join Queue Room**
```javascript
socket.emit('join-queue', { queueId: 'PQ-20240120-001' });
```

**Subscribe to Institution Updates**
```javascript
socket.emit('join-institution', { institutionId: 'inst-123' });
```

**Request Queue Position**
```javascript
socket.emit('get-position', { queueId: 'PQ-20240120-001' });
```

### Server → Client Events

**Queue Position Update**
```javascript
socket.on('queue-position-changed', (data) => {
  // { queueId, newPosition, estimatedWaitTime }
});
```

**Patient Called**
```javascript
socket.on('patient-called', (data) => {
  // { queueId, patientName, serviceCounter }
});
```

**Queue Status Update**
```javascript
socket.on('queue-status-updated', (data) => {
  // { queueId, oldStatus, newStatus, timestamp }
});
```

**Estimated Time Changed**
```javascript
socket.on('estimated-time-changed', (data) => {
  // { queueId, newEstimatedTime, reason }
});
```

**Queue Cancelled**
```javascript
socket.on('queue-cancelled', (data) => {
  // { queueId, reason, timestamp }
});
```

## 🧪 Testing

### Unit Testing
```bash
# Run all tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test queue.service.spec.ts

# Test WebSocket functionality (NEW)
npm run test websocket.gateway.spec.ts
```

### Integration Testing
```bash
# Run integration tests
npm run test:integration

# Test dengan database dan Redis
npm run test:e2e

# Test real-time features (NEW)
npm run test:realtime
```

### Coverage Requirements
- **Statements**: 100%
- **Branches**: 100% 
- **Functions**: 100%
- **Lines**: 100%

## 📦 Production Deployment

### Docker
```bash
# Build production image
docker build -t mediq/patient-queue-service:v3.0 .

# Run container with WebSocket support
docker run -p 8605:8605 -p 8606:8606 \
  -e DATABASE_URL="mysql://user:pass@mysql:3306/mediq_queue" \
  -e REDIS_HOST=redis \
  -e RABBITMQ_URL="amqp://rabbitmq:5672" \
  -e WEBSOCKET_PORT=8606 \
  -e API_GATEWAY_URL="http://api-gateway:8601" \
  mediq/patient-queue-service:v3.0
```

### Kubernetes
```bash
# Deploy to cluster
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=patient-queue-service

# View logs
kubectl logs -f deployment/patient-queue-service

# Check WebSocket service (NEW)
kubectl get svc patient-queue-websocket-service
```

### CI/CD Pipeline
- **GitHub Actions**: Automated testing, build, dan deployment
- **Security Scanning**: Dependency vulnerability checks
- **Multi-environment**: Staging (otomatis) + Production (manual approval)
- **🆕 WebSocket Health Checks**: Real-time connection monitoring

## 🏗️ Arsitektur

### Database Schema
```sql
model QueueHistory {
  id                String    @id @default(uuid())
  patientNik        String    // NIK pasien
  patientName       String    // Nama lengkap pasien
  institutionId     String    // ID faskes
  serviceName       String    // Nama poli/layanan
  queueNumber       Int       // Nomor urut antrian
  priority          String    // URGENT, HIGH, NORMAL, LOW
  status            String    @default("WAITING") // Status antrian
  position          Int       // NEW: Current position in queue
  createdAt         DateTime  @default(now())
  calledAt          DateTime? // Waktu dipanggil
  finishedAt        DateTime? // Waktu selesai
  estimatedWaitTime Int       // Estimasi waktu tunggu (menit)
  keterangan        String?   // Keterangan tambahan
  lastNotified      DateTime? // NEW: Last notification timestamp
}

model QueueNotification {
  id            String   @id @default(uuid())
  queueId       String   // Reference to queue
  type          String   // Notification type
  message       String   // Notification message
  isRead        Boolean  @default(false)
  createdAt     DateTime @default(now())
  data          Json?    // Additional notification data
}
```

### Message Patterns (RabbitMQ)
```typescript
// Dari OCR Service (otomatis setelah scan KTP)
'queue.add-from-ocr': { nik, nama, ...ktpData }

// Internal operations
'queue.add-to-queue': CreatePatientQueueDto
'queue.get-next': {}
'queue.update-status': { queueId, status }
'queue.get-stats': {}

// NEW: Real-time operations
'queue.position-changed': { queueId, newPosition, estimatedTime }
'queue.notification-created': { queueId, notificationType, data }
```

### Enhanced Cache Strategy (Redis)
```typescript
// Real-time queue data
QUEUE_KEY = `queue:${date}:${status}`
TTL = 1800 seconds (30 minutes)

// Queue position tracking (NEW)
POSITION_KEY = `queue:position:${queueId}`
TTL = 3600 seconds (1 hour)

// Statistics cache
STATS_KEY = `queue:stats:${date}`
TTL = 300 seconds (5 minutes)

// Notification cache (NEW)
NOTIFICATION_KEY = `notifications:${queueId}`
TTL = 300 seconds (5 minutes)

// Real-time metrics (NEW)
METRICS_KEY = `queue:metrics:realtime`
TTL = 60 seconds (1 minute)
```

### WebSocket Architecture (NEW)
```typescript
// WebSocket Gateway Integration
class QueueWebSocketGateway {
  // Room management
  @SubscribeMessage('join-queue')
  handleJoinQueue(client: Socket, payload: { queueId: string })
  
  // Real-time updates
  @OnQueuePositionChange()
  broadcastPositionUpdate(queueId: string, position: number)
  
  // Notification broadcasting
  @OnNotificationCreate()
  sendNotification(queueId: string, notification: QueueNotification)
}
```

## 🔧 Development

### Project Structure
```
src/
├── queue/
│   ├── dto/                    # Data Transfer Objects
│   ├── entities/              # Database entities
│   ├── queue.controller.ts    # HTTP endpoints
│   ├── queue.service.ts       # Business logic
│   ├── queue.gateway.ts       # NEW: WebSocket gateway
│   └── queue.module.ts        # Module configuration
├── notifications/             # NEW: Notification system
│   ├── dto/
│   ├── notification.controller.ts
│   ├── notification.service.ts
│   └── notification.module.ts
├── websocket/                 # NEW: WebSocket infrastructure
│   ├── websocket.adapter.ts
│   └── websocket.gateway.ts
├── redis/                     # Enhanced Redis service
├── prisma/                    # Database service
├── app.module.ts             # Main application module
└── main.ts                   # Application bootstrap
```

### Code Style
- **ESLint**: TypeScript recommended dengan Prettier
- **Formatting**: Single quotes, trailing commas
- **Imports**: Absolute imports dengan path mapping
- **Validation**: class-validator untuk DTOs
- **Documentation**: JSDoc untuk complex functions
- **🆕 WebSocket Standards**: Socket.IO best practices

### Development Scripts
```bash
# Development dengan hot reload
npm run start:dev

# Build production
npm run build

# Linting dan formatting
npm run lint
npm run format

# Database operations
npx prisma studio          # Database GUI
npx prisma migrate dev      # Create migration
npx prisma generate        # Generate client

# NEW: WebSocket development
npm run start:ws-dev       # Start with WebSocket debugging
npm run test:ws            # Test WebSocket functionality
```

## 🚨 Monitoring & Troubleshooting

### Health Checks
```bash
# Basic health check
curl http://localhost:8605/health

# Detailed service status
curl http://localhost:8605/queue/stats

# NEW: WebSocket health check
curl http://localhost:8605/websocket/health

# NEW: Real-time metrics
curl http://localhost:8605/queue/metrics/realtime
```

### Common Issues

**Database Connection Error**:
```bash
# Check MySQL connection
mysql -h localhost -u username -p

# Verify DATABASE_URL format
DATABASE_URL="mysql://username:password@host:port/database"
```

**Enhanced Redis Connection Error**:
```bash
# Test Redis connection
redis-cli -h localhost -p 6379 ping

# Check Redis authentication
redis-cli -h localhost -p 6379 -a password ping

# NEW: Monitor real-time cache
redis-cli -h localhost -p 6379 monitor
```

**RabbitMQ Issues**:
```bash
# Check RabbitMQ status
rabbitmq-diagnostics status

# View queues
rabbitmqctl list_queues
```

**WebSocket Issues (NEW)**:
```bash
# Test WebSocket connection
wscat -c ws://localhost:8605/socket.io

# Check WebSocket logs
npm run logs:websocket

# Monitor WebSocket connections
curl http://localhost:8605/websocket/connections
```

### Logging
```typescript
// Structured logging dengan Pino
logger.info('Patient added to queue', { 
  queueId: 'PQ-20240120-001',
  patientNik: '3171012345678901',
  priority: 'NORMAL',
  position: 3,  // NEW: Queue position
  estimatedWaitTime: 45  // NEW: Real-time estimate
});

// NEW: WebSocket event logging
logger.info('WebSocket event emitted', {
  event: 'queue-position-changed',
  queueId: 'PQ-20240120-001',
  clientsNotified: 5
});
```

## 🤝 Contributing

1. **Fork** repository
2. **Create branch** untuk feature (`git checkout -b feature/amazing-feature`)
3. **Write tests** dengan 100% coverage
4. **Commit changes** (`git commit -m 'Add amazing feature'`)
5. **Push branch** (`git push origin feature/amazing-feature`)
6. **Create Pull Request**

### Code Review Checklist
- ✅ Unit tests dengan 100% coverage
- ✅ Integration tests untuk RabbitMQ communication
- ✅ 🆕 WebSocket tests untuk real-time functionality
- ✅ 🆕 Notification system tests
- ✅ Swagger documentation updated
- ✅ Environment variables documented
- ✅ Error handling implemented
- ✅ Performance considerations addressed
- ✅ 🆕 Real-time performance optimization

## 📄 License

**Dual License**: Apache-2.0 + Commercial License (Royalty)

**Copyright (c) 2025 Alif Nurhidayat (KillerKing93)**

### **Open Source License**
Licensed under the Apache License, Version 2.0 (the "License");  
you may not use this file except in compliance with the License.  
You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

### **Commercial License**  
For commercial use, proprietary modifications, or usage in closed-source projects,  
a commercial license is required.  
**Contact**: alifnurhidayatwork@gmail.com

Unless required by applicable law or agreed to in writing, software  
distributed under the License is distributed on an "AS IS" BASIS,  
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  
See the License for the specific language governing permissions and  
limitations under the License.

---

**💡 Tips**: 
- Gunakan `npm run test:watch` untuk development dengan TDD
- Check Swagger docs di `/api/docs` untuk interactive API testing
- Monitor aplikasi dengan `npm run start:dev` untuk real-time logs
- Gunakan Redis CLI untuk debug cache issues: `redis-cli monitor`
- **🆕 NEW**: Test WebSocket dengan `wscat -c ws://localhost:8605/socket.io`
- **🆕 NEW**: Monitor real-time queue updates di `/queue/metrics/realtime`
