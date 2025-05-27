import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { createFailureResponse } from '../utils/response.util';
import { generateErrorCode } from '../utils/error-code.util';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from '../../logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let errorCode = generateErrorCode(status);
    let trace = '';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorCode = generateErrorCode(status);
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if ((res as any)?.error?.message) {
        message = (res as any).error.message;
        errorCode = (res as any).error.code || errorCode;
      } else if ((res as any)?.message) {
        message = (res as any).message;
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
      trace = exception.stack;
    }
    this.logger.error(`[${errorCode}] ${message}`, trace, 'GlobalExceptionFilter');
    response.status(status).json(createFailureResponse({ message }, errorCode));
  }
}
