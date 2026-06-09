import e from "express";

class ApiError {
    statusCode: number;
    message: string = "Something went wrong";
    success: boolean;
    errors: any[];
    stack?: string;

    constructor(
        statusCode: number,
        message: string,
        errors = [],
        stack?: string
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;
