import { Server } from 'socket.io';
import { SocketEvent, UserStatus } from '../enums/socket.enum.js';
import { WSResponseBuilder } from '../utils/api.builder.js';
import { SocketAuthMiddleware } from '../middlewares/authentication.js';
import RedisSocketRepository  from '../repository/redis/socket.repo.js';
import { createAdapter } from '@socket.io/redis-adapter';
import configureRedisClient from '../databases/redis.js';
import LocationRepository from "../repository/mongo/Location.js";


class SocketHandler {
    constructor(httpServer, logger) {
        const pubClient = configureRedisClient();
        const subClient = pubClient.duplicate();

        this.io = new Server(httpServer);
        this.io.adapter(createAdapter(pubClient, subClient));
        this.io.use(SocketAuthMiddleware);

        this.logger = logger;
        this.initializeSocketIO();

        this.redisSocketRepository = new RedisSocketRepository()
    }

    initializeSocketIO() {
        this.io.on('connection', socket => {
            this.handleConnection(socket);
        });
    }

    handleAuthentication(socket) {
        this.addUserSocket(socket, socket?.user?.user_id);
    }

    async handleConnection(socket) {
        this.handleAuthentication(socket);

        this.logger.info('socket-server connected!');
        this.logger.info(JSON.stringify(socket.id));

        socket.on(SocketEvent.UPDATE_LOCATION, ({ location_id, latitude, longitude }) => {
            this.updateLocation(socket, location_id, latitude, longitude);
        });
        socket.on(SocketEvent.DISCONNECT, reason => {
            this.handleDisconnect(socket, reason);
        });

    }

    async handleDisconnect(socket, reason) {
        const userId = socket?.user?.user_id;
        this.logger.info(`${userId} has disconnected from ws, ${reason}`);
        await this.removeUser(socket, userId);
    }

    async addUser(socket, userId) {
        const checkUser = await this.redisSocketRepository.getGlobalUser(userId);

        if (!checkUser) {
            await this.redisSocketRepository.storeGlobalUser(userId, { socketId: socket.id, userId });
        } else {
            await this.redisSocketRepository.updateOnlineGlobalUsers(userId, { socketId: socket.id, userId });
        }

        if (!checkUser) {
            socket.broadcast.emit(
                SocketEvent.ONLINE_USERS,
                WSResponseBuilder.builder()
                    .withData(Array.from(await this.redisSocketRepository.getAllGlobalOnlineUsers()))
                    .build(),
            );
        }
    }

    async addUserSocket(socket, userId) {
        const checkUser = await this.redisSocketRepository.getOnlineUserStatus(userId);

        const userData = { socketId: socket?.id, userId };
        if (!checkUser) {
            await this.redisSocketRepository.storeGlobalUser(userId, userData);
        } else {
            await this.redisSocketRepository.updateOnlineGlobalUsers(userId, userData);
        }

        if (!checkUser) {
            // TODO: Handle broadcast
            // socket.broadcast.emit(
            //   SocketEvent.ONLINE_USERS,
            //   WSResponseBuilder.builder()
            //     .withData(Array.from(await this.redisSocketRepository.getAllGlobalOnlineUsers()))
            //     .build(),
            // );
        }

        socket.broadcast.emit(
            SocketEvent.ONLINE_USER,
            WSResponseBuilder.builder()
                .withData({ status: UserStatus.ONLINE, ...userData })
                .build(),
        );
    }

    async removeUser(socket, userId) {
        await this.redisSocketRepository.removeGlobalUser(userId);
        await this.redisSocketRepository.removeOnlineUsers(userId);

        const userData = { socketId: socket?.id, userId };

        // on disconnect this over broadcast
        // socket.broadcast.emit(
        //   SocketEvent.ONLINE_USERS,
        //   WSResponseBuilder.builder()
        //     .withData(Array.from(await this.redisSocketRepository.getAllGlobalOnlineUsers()))
        //     .build(),
        // );
        socket.broadcast.emit(
            SocketEvent.ONLINE_USER,
            WSResponseBuilder.builder()
                .withData({ status: UserStatus.OFFLINE, ...userData })
                .build(),
        );
    }

    async updateLocation(socket, location_id, latitude, longitude) {
        const updatedValues = {
            $set: {
                latitude: latitude,
                longitude: longitude
            }
        }
        const updatedLocation = await LocationRepository.findOneAndUpdate({_id :location_id}, updatedValues, { new: false });
        socket.broadcast.emit(
            SocketEvent.LOCATION_UPDATED,
            WSResponseBuilder.builder()
                .withData({...updatedLocation})
                .build(),
        );
    }
}

export default SocketHandler;
