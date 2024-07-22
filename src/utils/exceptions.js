export default class HttpException extends Error {
    constructor(status, debugMessage, message = 'endpoint failed') {
        // make error in explicit in production
        if (process.env.NODE_ENV === 'production') {
            super(message);
            this.message = message;
        } else {
            super(debugMessage);
            this.message = debugMessage;
        }
        this.status = status;
    }
}
