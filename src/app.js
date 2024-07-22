import hpp from 'hpp';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import express from "express";
import {createServer} from "http";
import mongoose from "mongoose";
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from './utils/config.js';
import { logger, stream } from './utils/logger.js';
import ErrorMiddleware from "./middlewares/error.js";
import APIResponseBuilder from "./utils/api.builder.js";
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import useragent from 'express-useragent';
import SocketHandler from "./socket/app.js";

export class App {
    constructor(routes) {
        this.app = express();
        this.server = createServer(this.app);

        this.env = NODE_ENV || 'development';
        this.port = PORT || 3000;

        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeSwagger();
        this.initializeErrorHandling();
        this.initialize404Handling();
        this.initializeMongooseConnection();

        const socket = new SocketHandler(this.server, logger);
        this.app.set('io', socket);
        global.io = socket;
    }

    listen() {
        this.server.listen(this.port, () => {
            logger.info(`=================================`);
            logger.info(`======= ENV: ${this.env} =======`);
            logger.info(`🚀 App listening on the port ${this.port}`);
            logger.info(`=================================`);
        });
    }

    getServer() {
        return this.app;
    }

    initializeMongooseConnection(){
        const dbConnectionString = process.env.DATABASE_URL;

        mongoose.connect(dbConnectionString, {
            useNewUrlParser: true,
        }).then(() => {
            logger.info('🚀 Connected to MongoDB');
        }).catch(err => {
            logger.error('Failed to connect to MongoDB', err);
        });

    }
    initializeMiddlewares() {
        this.app.use(morgan(LOG_FORMAT, { stream }));
        this.app.use(useragent.express());
        this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
        this.app.use(hpp());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
    }

    initializeRoutes(routes) {
        routes.forEach(route => {
            this.app.use('/', route.router);
        });
    }

    initialize404Handling() {
        // Middleware for handling 404 routes
        this.app.use((req, res) => {
            return APIResponseBuilder.builder().withStatusCode(400).withMessage(`The requested URL '${req.url}' was not found on this server.`).build(res).send();
        });
    }

    initializeSwagger() {
        const options = {
            swaggerDefinition: {
                info: {
                    title: 'REST API',
                    version: '1.0.0',
                    description: 'Example docs',
                },
            },
            apis: ['swagger.yaml'],
        };

        const specs = swaggerJSDoc(options);
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
    }

    initializeErrorHandling() {
        this.app.use(ErrorMiddleware);
    }
}
