import { HttpServiceWrapper } from '../../src/common/http/http.service';
import { AxiosHeaders } from 'axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpException } from '@nestjs/common';

jest.mock('../../src/common/utils/response.util', () => ({
  createFailureResponse: jest.fn((payload, code) => ({ ...payload, code })),
}));

describe('HttpServiceWrapper', () => {
  let wrapper: HttpServiceWrapper;
  const mockHttpService = {
    request: jest.fn(),
  };

  beforeEach(() => {
    wrapper = new HttpServiceWrapper(mockHttpService as any);
    jest.clearAllMocks();
  });

  const mockResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

  describe('successful requests', () => {
    it('should perform GET request', async () => {
      mockHttpService.request.mockReturnValue(of(mockResponse({ ok: true })));
      const result = await wrapper.get('http://example.com');
      expect(result).toEqual({ ok: true });
    });

    it('should perform POST request', async () => {
      mockHttpService.request.mockReturnValue(of(mockResponse({ id: 1 })));
      const result = await wrapper.post('http://example.com', { name: 'test' });
      expect(result).toEqual({ id: 1 });
    });

    it('should perform PUT request', async () => {
      mockHttpService.request.mockReturnValue(
        of(mockResponse({ updated: true })),
      );
      const result = await wrapper.put('http://example.com', { name: 'new' });
      expect(result).toEqual({ updated: true });
    });

    it('should perform DELETE request', async () => {
      mockHttpService.request.mockReturnValue(
        of(mockResponse({ deleted: true })),
      );
      const result = await wrapper.delete('http://example.com');
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('error handling', () => {
    it('should handle error response with status and message', async () => {
      mockHttpService.request.mockReturnValue(
        throwError(() => ({
          response: {
            status: 404,
            data: { message: 'Not Found' },
          },
        })),
      );

      await expect(wrapper.get('http://fail.com')).rejects.toThrow(
        HttpException,
      );
      try {
        await wrapper.get('http://fail.com');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(404);
        expect(err.getResponse()).toEqual({
          message: 'Not Found',
          code: 'EXTERNAL_API_ERROR',
        });
      }
    });

    it('should default to 500 if no response status', async () => {
      mockHttpService.request.mockReturnValue(
        throwError(() => new Error('Generic failure')),
      );

      try {
        await wrapper.get('http://error.com');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(500);
        expect(err.getResponse()).toEqual({
          message: 'Generic failure',
          code: 'EXTERNAL_API_ERROR',
        });
      }
    });
  });
});
