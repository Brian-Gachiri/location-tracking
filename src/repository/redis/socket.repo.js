import { logger } from '../../utils/logger.js';
import configureRedisClient from '../../databases/redis.js';


class RedisSocketRepository {
    constructor() {
        this.key = 'socket-';
        this.onlineUserKey = 'online-users';
        this.redisClient = configureRedisClient();
    }

    async getRedisIndex(userId) {
        const messages = await this.redisClient.lrange(this.onlineUserKey, 0, -1);
        return messages.findIndex((msg) => {
            const parsedMsg = JSON.parse(msg);
            return parsedMsg.userId === userId;
        });
    }

    async removeOnlineUsers(userId) {
        try {
            const index = await this.getRedisIndex(userId);

            if (index !== -1) {
                await this.redisClient.lset(this.onlineUserKey, index, '__DELETED__'); // Placeholder for deletion
                await this.redisClient.lrem(this.onlineUserKey, 1, '__DELETED__');
            }

            return index; // Message not found
        } catch (error) {
            // Handle the error here
            logger.error('Error deleting online users by userId:', error);
            throw error;
        }
    }

    async storeGlobalUser(userId, socketData) {
        try {
            const messages = await this.redisClient.set(this.key + userId, JSON.stringify(socketData));
            await this.redisClient.lpush(this.onlineUserKey, JSON.stringify(socketData));

            const expiryTime = 60 * 60 * 24 * 2;
            this.redisClient.expire(this.key + userId, expiryTime);
            return messages;
        } catch (error) {
            // Handle the error here
            logger.error('Error saving new message:', error);
        }
    }

    async getGlobalUser(userId) {
        try {
            const data = await this.redisClient.get(this.key + userId);
            if (data) return JSON.parse(data);
            return null;
        } catch (error) {
            // Handle the error here
            logger.error('Error storing removedUser:', error);
        }
    }

    async getOnlineUserStatus(userId) {
        const index = await this.getRedisIndex(userId);
        return index != -1;
    }

    async updateOnlineGlobalUsers(userId, socketData){
        try {
            // First, delete the old message
            const index = await this.getRedisIndex(userId);

            if (index !== -1) {
                await this.redisClient.lset(this.onlineUserKey, index, JSON.stringify(socketData));
            }

            return true;
        } catch (error) {
            // Handle the error here
            logger.error('Error updating message:', error);
            throw error;
        }
    }

    async getAllGlobalOnlineUsers() {
        try {
            return (await this.redisClient.lrange(this.onlineUserKey, 0, -1)).map(item => JSON.parse(item));
        } catch (error) {
            // Handle the error here
            logger.error('Error storing removedUser:', error);
        }
    }

    async removeGlobalUser(userId){
        return await this.redisClient.del(this.key + userId);
    }
}

export default RedisSocketRepository;
