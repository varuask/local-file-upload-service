const { Queue } = require('bullmq');
const redisConnection = require('../../config/redis');

const fileQueue = new Queue('file-processing', {
  connection: redisConnection,
});

module.exports = fileQueue;
