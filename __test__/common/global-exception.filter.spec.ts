import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { createFailureResponse } from '../../src/common/utils/response.util';
import { Logger } from '../../src/logger/logger.service';

jest.mock('../../src/common/utils/response.util', () => ({
  createFailureResponse: jest.fn((payload, code) => ({ ...payload, code })),
}));
jest.mock('../../src/common/utils/error-code.util', () => ({
  generateErrorCode: (status: number) => `ERR_${status}`,
}));

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  const mockLogger = {
    error: jest.fn(),
  } as unknown as Logger;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const mockHost = {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
    }),
  } as unknown as ArgumentsHost;

  beforeEach(() => {
    jest.clearAllMocks();
    filter = new GlobalExceptionFilter(mockLogger);
  });

  it('should handle HttpException with string message', () => {
    const exception = new HttpException(
      'Forbidden access',
      HttpStatus.FORBIDDEN,
    );

    filter.catch(exception, mockHost);

    expect(mockLogger.error).toHaveBeenCalledWith(
      `[ERR_403] Forbidden access`,
      '',
      'GlobalExceptionFilter',
    );
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Forbidden access',
      code: 'ERR_403',
    });
  });

  it('should handle HttpException with object response', () => {
    const exception = new HttpException(
      { message: 'Custom error', error: { code: 'ERR_CUSTOM' } },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockLogger.error).toHaveBeenCalledWith(
      `[ERR_400] Custom error`,
      '',
      'GlobalExceptionFilter',
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Custom error',
      code: 'ERR_400',
    });
  });

  it('should handle standard Error object', () => {
    const exception = new Error('Something failed');
    exception.stack = 'stack trace here';

    filter.catch(exception, mockHost);

    expect(mockLogger.error).toHaveBeenCalledWith(
      `[ERR_500] Something failed`,
      'stack trace here',
      'GlobalExceptionFilter',
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Something failed',
      code: 'ERR_500',
    });
  });

  it('should handle unknown exception type', () => {
    filter.catch({} as any, mockHost);

    expect(mockLogger.error).toHaveBeenCalledWith(
      `[ERR_500] Internal Server Error`,
      '',
      'GlobalExceptionFilter',
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      code: 'ERR_500',
    });
  });
});
