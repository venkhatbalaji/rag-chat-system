import {
  createSuccessResponse,
  createFailureResponse,
  ApiResponse,
} from '../../src/common/utils/response.util';

describe('response.util', () => {
  describe('createSuccessResponse', () => {
    it('should return a success response with data', () => {
      const payload = { id: 1, name: 'Test' };
      const result = createSuccessResponse(payload);

      const expected: ApiResponse = {
        success: true,
        data: payload,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('createFailureResponse', () => {
    it('should return a failure response with message and code', () => {
      const error = { message: 'Something went wrong' };
      const code = 'E-500';
      const result = createFailureResponse(error, code);

      const expected: ApiResponse = {
        success: false,
        error: {
          message: 'Something went wrong',
          code: 'E-500',
        },
      };

      expect(result).toEqual(expected);
    });

    it('should only include message and code in error object', () => {
      const result = createFailureResponse(
        { message: 'Invalid input' },
        'E-400',
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Invalid input');
      expect(result.error?.code).toBe('E-400');
      expect(result).not.toHaveProperty('data');
    });
  });
});
