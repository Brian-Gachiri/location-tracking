import Redis from 'ioredis';
import { NODE_ENV } from '../utils/config.js';

let redisClientInstance = null;

export default function configureRedisClient() {
    if (!redisClientInstance) {
        if (NODE_ENV === 'development') {
            redisClientInstance = new Redis({});
        } else {
            redisClientInstance = new Redis();
        }
    }
    return redisClientInstance;
}
