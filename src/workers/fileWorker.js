import { PrismaClient } from '@prisma/client';
import { Worker } from 'bullmq';
import fs from 'fs/promises';
import IORedis from 'ioredis';

const prisma = new PrismaClient();

const connection = new IORedis({
  maxRetriesPerRequest: null,
});

const worker = new Worker('file-processing', async (job) => {
  const { fileId, storagePath } = job.data;

  try {
    const stats = await fs.stat(storagePath);
    const extractedData = JSON.stringify({
      size: stats.size,
      processedAt: new Date(),
    });

    await prisma.file.update({
      where: { id: fileId },
      data: {
        extractedData,
        status: 'PROCESSED',
      },
    });

    console.log(`✅ Processed file ID ${fileId}`);
  } catch (error) {
    console.error('❌ Processing failed:', error);
    await prisma.file.update({
      where: { id: fileId },
      data: {
        status: 'FAILED',
      },
    });
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.log(`❌ Job ${job.id} failed with ${err.message}`);
});
