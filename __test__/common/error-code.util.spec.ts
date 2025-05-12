import { generateErrorCode } from '../../src/common/utils/error-code.util';
import { HttpStatus } from '@nestjs/common';

describe('generateErrorCode', () => {
  it('should generate error code for known HttpStatus', () => {
    expect(generateErrorCode(HttpStatus.BAD_REQUEST)).toBe('E-400');
    expect(generateErrorCode(HttpStatus.NOT_FOUND)).toBe('E-404');
    expect(generateErrorCode(HttpStatus.INTERNAL_SERVER_ERROR)).toBe('E-500');
  });

  it('should work with numeric status directly', () => {
    expect(generateErrorCode(418)).toBe('E-418');
    expect(generateErrorCode(999)).toBe('E-999');
  });

  it('should return string format always', () => {
    const result = generateErrorCode(401);
    expect(typeof result).toBe('string');
    expect(result).toMatch(/^E-\d+$/);
  });
});
