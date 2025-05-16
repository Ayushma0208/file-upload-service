# File Upload Service 🗃️

A secure Node.js microservice for authenticated file uploads, background processing, and metadata storage.

## 🛠️ How to Run

### Prerequisites
- Node.js v18+
- Redis (for background jobs)
- PostgreSQL or SQLite
- (Optional) Docker

### Setup

```bash
git clone the repo
cd file-upload-service
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm start   # starts main API server
npm run worker   # starts BullMQ worker
