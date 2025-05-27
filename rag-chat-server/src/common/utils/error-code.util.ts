import { HttpStatus } from '@nestjs/common';

export function generateErrorCode(status: HttpStatus | number): string {
  return `E-${status}`;
}