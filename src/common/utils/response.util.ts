export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function createFailureResponse(
  error: { message: string },
  code: string,
): ApiResponse {
  return {
    success: false,
    error: {
      message: error.message,
      code,
    },
  };
}
