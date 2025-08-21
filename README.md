# MediQ Backend - Patient Queue Service

## 📋 Deskripsi

Layanan **Patient Queue Service** adalah bagian dari sistem MediQ yang mengelola sistem antrian pasien digital untuk fasilitas kesehatan. Service ini menggantikan sistem antrian konvensional dengan sistem digital yang cerdas dengan prioritas otomatis dan estimasi waktu tunggu.

## ✨ Fitur Utama

### 🏥 Manajemen Antrian Digital
- **Sistem Prioritas**: URGENT → HIGH → NORMAL → LOW
- **Estimasi Waktu Tunggu**: Otomatis berdasarkan posisi antrian (15 menit per pasien)
- **Status Antrian**: WAITING → IN_PROGRESS → COMPLETED/CANCELLED
- **Nomor Antrian**: Format PQ-YYYYMMDD-XXX (contoh: PQ-20240120-001)

### 📊 Analytics & Statistik
- **Statistik Harian**: Total pasien, rata-rata waktu tunggu, distribusi per jam
- **Laporan Real-time**: Monitoring antrian yang sedang berlangsung
- **Dashboard Analytics**: Trend mingguan dan monthly untuk management

### 🔄 Integrasi Microservices
- **RabbitMQ Communication**: Komunikasi dengan OCR Service untuk pendaftaran otomatis
- **Redis Caching**: Performa tinggi untuk data antrian real-time
- **MySQL Database**: Penyimpanan persisten untuk histori dan analytics

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

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_TTL=3600

# RabbitMQ
RABBITMQ_URL="amqp://localhost:5672"

# Logging
LOG_LEVEL=info
```

## 📋 API Endpoints

### Base URL
**Development**: `http://localhost:8605`  
**Production**: `https://api.mediq.com`

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

#### 📊 Statistics & Analytics

**Statistik Antrian Hari Ini**
```http
GET /queue/stats
```

**Laporan Harian**
```http
GET /stats/daily?date=2024-01-20
```

**Trend Mingguan**
```http
GET /stats/weekly
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
```

### Integration Testing
```bash
# Run integration tests
npm run test:integration

# Test dengan database dan Redis
npm run test:e2e
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
docker build -t mediq/patient-queue-service:latest .

# Run container
docker run -p 8605:8605 \
  -e DATABASE_URL="mysql://user:pass@mysql:3306/mediq_queue" \
  -e REDIS_HOST=redis \
  -e RABBITMQ_URL="amqp://rabbitmq:5672" \
  mediq/patient-queue-service:latest
```

### Kubernetes
```bash
# Deploy to cluster
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=patient-queue-service

# View logs
kubectl logs -f deployment/patient-queue-service
```

### CI/CD Pipeline
- **GitHub Actions**: Automated testing, build, dan deployment
- **Security Scanning**: Dependency vulnerability checks
- **Multi-environment**: Staging (otomatis) + Production (manual approval)

## 🏗️ Arsitektur

### Database Schema
```sql
model QueueHistory {
  id            String   @id @default(uuid())
  patientNik    String   // NIK pasien
  patientName   String   // Nama lengkap pasien
  institutionId String   // ID faskes
  serviceName   String   // Nama poli/layanan
  queueNumber   Int      // Nomor urut antrian
  priority      String   // URGENT, HIGH, NORMAL, LOW
  status        String   @default("WAITING") // Status antrian
  createdAt     DateTime @default(now())
  calledAt      DateTime? // Waktu dipanggil
  finishedAt    DateTime? // Waktu selesai
  estimatedWaitTime Int  // Estimasi waktu tunggu (menit)
  keterangan    String?  // Keterangan tambahan
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
```

### Cache Strategy (Redis)
```typescript
// Real-time queue data
CACHE_KEY = `queue:${date}:${status}`
TTL = 3600 seconds (1 hour)

// Statistics cache
STATS_KEY = `queue:stats:${date}`
TTL = 300 seconds (5 minutes)
```

## 🔧 Development

### Project Structure
```
src/
├── queue/
│   ├── dto/           # Data Transfer Objects
│   ├── queue.controller.ts  # HTTP endpoints
│   ├── queue.service.ts     # Business logic
│   └── queue.module.ts      # Module configuration
├── prisma/            # Database service
├── app.module.ts      # Main application module
└── main.ts           # Application bootstrap
```

### Code Style
- **ESLint**: TypeScript recommended dengan Prettier
- **Formatting**: Single quotes, trailing commas
- **Imports**: Absolute imports dengan path mapping
- **Validation**: class-validator untuk DTOs
- **Documentation**: JSDoc untuk complex functions

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
```

## 🚨 Monitoring & Troubleshooting

### Health Checks
```bash
# Basic health check
curl http://localhost:8605/health

# Detailed service status
curl http://localhost:8605/queue/stats
```

### Common Issues

**Database Connection Error**:
```bash
# Check MySQL connection
mysql -h localhost -u username -p

# Verify DATABASE_URL format
DATABASE_URL="mysql://username:password@host:port/database"
```

**Redis Connection Error**:
```bash
# Test Redis connection
redis-cli -h localhost -p 6379 ping

# Check Redis authentication
redis-cli -h localhost -p 6379 -a password ping
```

**RabbitMQ Issues**:
```bash
# Check RabbitMQ status
rabbitmq-diagnostics status

# View queues
rabbitmqctl list_queues
```

### Logging
```typescript
// Structured logging dengan Pino
logger.info('Patient added to queue', { 
  queueId: 'PQ-20240120-001',
  patientNik: '3171012345678901',
  priority: 'NORMAL' 
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
- ✅ Swagger documentation updated
- ✅ Environment variables documented
- ✅ Error handling implemented
- ✅ Performance considerations addressed

## 📄 License

Copyright (c) 2024 MediQ Team. All rights reserved.

---

**💡 Tips**: 
- Gunakan `npm run test:watch` untuk development dengan TDD
- Check Swagger docs di `/api/docs` untuk interactive API testing
- Monitor aplikasi dengan `npm run start:dev` untuk real-time logs
- Gunakan Redis CLI untuk debug cache issues: `redis-cli monitor`
