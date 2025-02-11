import { join } from 'path';
import winston from 'winston';
import { LOG_DIR } from './config.js';
import { existsSync, mkdirSync } from 'fs';
import winstonDaily from 'winston-daily-rotate-file';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// logs dir
const logDir = join(__dirname, LOG_DIR);

if (!existsSync(logDir)) {
    mkdirSync(logDir);
}

// Define log format & timestamp
const timestampDefinition = { format: 'YYYY-MM-DDTHH:mm:ss.SSS Z' };
const logFormat = winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(timestampDefinition), logFormat),
    transports: [
        // debug log setting
        new winstonDaily({
            level: 'debug',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/debug', // log file /logs/debug/*.log in save
            filename: `%DATE%.log`,
            maxFiles: 30, // 30 Days saved
            json: false,
            zippedArchive: true,
        }),
        // error log setting
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error', // log file /logs/error/*.log in save
            filename: `%DATE%.log`,
            maxFiles: 30, // 30 Days saved
            handleExceptions: true,
            json: false,
            zippedArchive: true,
        }),
    ],
});

logger.add(
    new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(timestampDefinition), logFormat),
    }),
);

const stream = {
    write: (message) => {
        logger.info(message.substring(0, message.lastIndexOf('\n')));
    },
};

export { logger, stream };
