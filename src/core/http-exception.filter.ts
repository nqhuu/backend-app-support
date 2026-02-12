import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { RESPONSE_MESSAGE } from 'src/decorator/customize';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private reflector: Reflector) { }

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        const message = exception.message || 'Internal server error';

        response.status(status).json({
            statusCode: status,
            message,
            data: null,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}