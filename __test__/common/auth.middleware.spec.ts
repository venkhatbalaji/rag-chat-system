import { AuthMiddleware } from '../../src/common/middleware/auth.middleware';
import { ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  const mockConfigService = {
    get: jest.fn(),
  };

  const mockRequest = {
    headers: {},
  } as unknown as Request;

  const mockResponse = {} as Response;
  const mockNext: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = new AuthMiddleware(mockConfigService as any);
  });

  it('should allow request with valid API key', () => {
    mockRequest.headers = { 'x-api-key': 'valid-key' };
    mockConfigService.get.mockReturnValue('valid-key');

    middleware.use(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw if API key is missing', () => {
    mockRequest.headers = {}; // no x-api-key
    mockConfigService.get.mockReturnValue('expected-key');

    expect(() => middleware.use(mockRequest, mockResponse, mockNext)).toThrow(
      ForbiddenException,
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw if API key is invalid', () => {
    mockRequest.headers = { 'x-api-key': 'wrong-key' };
    mockConfigService.get.mockReturnValue('expected-key');

    expect(() => middleware.use(mockRequest, mockResponse, mockNext)).toThrow(
      ForbiddenException,
    );
    expect(mockNext).not.toHaveBeenCalled();
  });
});
