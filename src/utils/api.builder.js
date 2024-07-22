export class WSResponseBuilder {
    static builder() {
        return new WSResponseBuilder();
    }

    withSuccess(success) {
        this.success = success;
        return this;
    }

    withData(data) {
        this.data = data;
        return this;
    }

    withMessage(message) {
        this.message = message;
        return this;
    }

    build() {
        let message = this.message;
        if (this.success && !this.message) message = 'success';
        else if (!this.success && !this.message) message = 'failed';

        return { message: message, data: this.data, success: this.success };
    }
}

export default class APIResponseBuilder {
    static builder() {
        return new APIResponseBuilder();
    }

    withSuccess(success) {
        this.success = success;
        return this;
    }

    withData(data) {
        this.data = data;
        return this;
    }

    withMessage(message) {
        this.message = message;
        return this;
    }

    withStatusCode(statusCode) {
        this.statusCode = statusCode;

        if (!statusCode.toString().startsWith('2')) {
            this.success = false;
        }
        return this;
    }

    withPagination(paginationMeta) {
        this.paginationMeta = paginationMeta;
        return this;
    }

    build(res) {
        const response = new APIResponse(res, this.success, this.data, this.message);
        response.setStatusCode(this.statusCode);

        if (!this.success && !this.message) {
            response.setMessage('Unknown error occurred.');
        } else if (!this.message) {
            response.setMessage('success');
        }
        if (this.paginationMeta !== undefined) {
            response.setPagination(this.paginationMeta);
        }
        return response;
    }
}

class APIResponse {
    constructor(res, success, data = null, message = null) {
        this.res = res;

        this.data = {
            success,
            message,
        };

        if(data){
            this.data = { ...this.data, data}
        }
    }

    setMessage(message) {
        this.data.message = message;
        return this;
    }

    setStatusCode(statusCode) {
        this.res.status(statusCode);
        return this;
    }

    setPagination(paginationMeta) {
        this.data.pagination = paginationMeta;
        return this;
    }

    send() {
        this.res.json(this.data);
    }
}
