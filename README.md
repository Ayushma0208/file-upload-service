
📄 README.md

# File Upload Microservice

A secure Node.js-based microservice for authenticated file uploads, background metadata processing, and file management.

Built with:

* Node.js (ESM)
* Express.js
* Prisma ORM PostgreSQL(neonsql)
* BullMQ + Redis for background jobs
* JWT authentication
* Docker & Docker Compose
* Postman for testing

---

## 🚀 Getting Started

Follow these steps to run and test the project locally.

### 1. Extract and Navigate

Extract the zip and navigate into the project folder:

```bash
unzip file-upload-service.zip
cd file-upload-service
```

> On Windows: right-click the ZIP → “Extract All” → open in terminal or VS Code.

---

### 2. Install Dependencies

Make sure you have:

* Node.js v18+
* Docker Desktop (with WSL integration if using WSL)
* npm

Install project dependencies:

```bash
npm install
```

---

### 3. Setup Environment Variables

Copy the example .env file and update as needed:

```bash
cp .env.example .env
```

Default .env:

```env
PORT=5000
JWT_SECRET=your_jwt_secret
DATABASE_URL="file:./dev.db"
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

### 4. Start Docker

Start Redis and other services:

```bash
docker-compose up -d
```

---

### 5. Setup the Database

Run Prisma migration and generate the client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### 6. Run the Application

Start the server:

```bash
npm start
```

In a second terminal tab, start the background worker:

```bash
npm run worker
```

---

## 🧪 Testing with Postman

1. Open Postman
2. Click "Import" → select postman\_collection.json
3. Use the following sequence:

### Step 1: Register

* Method: POST
* URL: [http://localhost:5000/auth/register](http://localhost:5000/auth/register)
* Body (JSON):

```json
{
  "email": "test@example.com",
  "password": "test123"
}
```

### Step 2: Login

* Method: POST
* URL: [http://localhost:5000/auth/login](http://localhost:5000/auth/login)
* Body:

```json
{
  "email": "test@example.com",
  "password": "test123"
}
```

* Save the returned JWT token.

### Step 3: Upload a File

* Method: POST
* URL: [http://localhost:5000/upload](http://localhost:5000/upload)
* Auth: Bearer Token
* Form-Data:

  * file: \[Select a file]
  * metadata: {"type": "document"}

### Step 4: Check File Info

* Method: GET
* URL: [http://localhost:5000/files/\:fileId](http://localhost:5000/files/:fileId)

### Step 5: Download File

* Method: GET
* URL: [http://localhost:5000/files/download/\:fileId](http://localhost:5000/files/download/:fileId)

---

## 📦 Project Structure

```
file-upload-service/
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
│   ├── workers/
│   └── server.js
├── prisma/
│   └── schema.prisma
├── uploads/             # ignored in ZIP
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── postman_collection.json
└── README.md
```

---

## 🧠 Design Choices

* JWT-based stateless authentication
* Background processing via BullMQ for scalability
* File system storage for simplicity (can be swapped for S3)
* Modular architecture for clarity and testing
* SQLite for easy local dev (compatible with PostgreSQL)

---

## 🧱 Database Schema

See prisma/schema.prisma:

* User: email, hashed password
* File: filename, metadata, status, userId (FK)
* Job: background processing status tracking

---

## ⚙️ Background Job Handling

BullMQ + Redis are used to:

* Queue file processing jobs after upload
* Extract metadata in the worker
* Update file status (e.g., "uploaded" → "processed")

Worker logs will show job progress as files are handled.

---

## ✅ Security Practices

* JWT token validation & middleware protection
* Only authenticated users can upload/view/download
* Input validation and error handling
* Uploads directory isolated
* Background processing prevents heavy work in request lifecycle

---

## ⚠️ Known Limitations

* File type/size limits are not strictly enforced (can be added)
* No admin dashboard for jobs (BullMQ UI could be integrated)
* Metadata extraction is mocked (can be extended)
* No rate limiting (e.g., per-user limits)

---

## 🐳 Docker Setup

To run the project using Docker:

1. Ensure Docker Desktop is running
2. Use:

```bash
docker-compose up -d
```

3. Then run:

```bash
npm start
npm run worker
```

---

## 📬 Submission Checklist

* [x] Complete Node.js project
* [x] README with setup, API docs, design
* [x] Prisma schema and migrations
* [x] Background processor (BullMQ worker)
* [x] Postman collection
* [x] Dockerfile & docker-compose.yml
* [x] .env.example

---
