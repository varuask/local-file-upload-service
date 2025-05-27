const Redis = require('ioredis');

const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => {
  console.log('redis-server-is-now-connected');
});

redisConnection.on('error', (err) => {
  console.error('could-not-connect-to-the-redis-server', err);
});

module.exports = redisConnection;
