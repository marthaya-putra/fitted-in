import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status: number;
    let message: string;
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
      } else {
        message = exception.message;
      }

      stack = exception.stack;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      stack = exception instanceof Error ? exception.stack : undefined;
    }

    // Log the full error details to terminal using console.error for immediate output
    console.error(`[${new Date().toISOString()}] ERROR: ${request.method} ${request.url} - Status: ${status} - Message: ${message}`);
    if (stack) {
      console.error('Stack trace:', stack);
    }

    // Also use logger for proper NestJS logging
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      stack,
    );

    // If it's not an HttpException, log the full exception
    if (!(exception instanceof HttpException)) {
      console.error('Non-HTTP exception caught:', exception);
      this.logger.error('Non-HTTP exception caught:', exception);
    }

    // Send a user-friendly response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: status >= 500 ? 'Internal server error' : message,
    });
  }
}