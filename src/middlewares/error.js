import { logger } from '../utils/logger.js';

const ErrorMiddleware = (error, req, res, next) => {
    try {
        const status = error.status || 500;
        const message = error.message || 'Something went wrong';

        logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
        res.status(status).json({ message });
    } catch (error) {
        next(error);
    }
};

export default ErrorMiddleware;
