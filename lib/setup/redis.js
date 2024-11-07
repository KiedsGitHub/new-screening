const config = require('./config');

if (config.redis) {
    const Redis = require('ioredis');
    //global.redisClient = redis.createClient(config.redis === true ? 'redis://redis' : config.redis);
    global.redisClient = new Redis(config.redis === true ? 'redis://redis' : config.redis);
}

module.exports = global.redisClient;