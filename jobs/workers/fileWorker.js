require('dotenv').config();
const { Worker } = require('bullmq');
const fs = require('fs').promises;
const path = require('path');
const redisConnection = require('../../config/redis');
const File = require('../../models/File');

process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error(err);
});

const fileWorker = new Worker(
  'file-processing',
  async (job) => {
    console.log('job-received', job.data);
    const { fileId, storagePath } = job.data;
    if (!fileId || !storagePath || typeof storagePath !== 'string') {
      console.error('invalid-data-for-processing', job.data);
      await File.update(
        {
          status: 'failed',
          extracted_data: 'invalid-data',
          updated_at: Date.now(),
        },
        { where: { id: fileId || null } }
      );
      return;
    }
    try {
      const ext = path.extname(storagePath).toLowerCase();
      if (ext !== '.txt') {
        console.warn(
          `unsupported-file-type-for-processing-with-extension-${ext}`
        );
        await File.update(
          {
            status: 'failed',
            extracted_data: 'unsupported-file-type-for-processing',
            updated_at: Date.now(),
          },
          { where: { id: fileId } }
        );
        return;
      }
      const data = await fs.readFile(storagePath, 'utf-8');
      await File.update(
        {
          status: 'processed',
          extracted_data: data,
          updated_at: Date.now(),
        },
        { where: { id: fileId } }
      );
      console.log(`file-processed-successfully`);
    } catch (err) {
      console.error(`could-not-process-file-with-id-${fileId}:`, err);
      await File.update(
        {
          status: 'failed',
          extracted_data: 'could-not-be-processed',
          updated_at: Date.now(),
        },
        { where: { id: fileId } }
      );
      throw err;
    }
  },
  {
    connection: redisConnection,
  }
);

fileWorker.on('error', (err) => {
  console.error('error-log', err);
});

fileWorker.on('failed', (job, err) => {
  console.error(`failed-log`, err?.message || err);
});

fileWorker.on('active', (job) => {
  console.log(`active-job-${job.id}-log`);
});

fileWorker.on('completed', (job) => {
  console.log(`job-with-id-${job.id}-completed-successfully-log`);
});

fileWorker.on('ready', () => {
  console.log('worker-ready-log');
});
