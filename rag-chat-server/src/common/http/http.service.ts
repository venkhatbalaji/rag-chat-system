import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { createFailureResponse } from '../utils/response.util';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class HttpServiceWrapper {
  constructor(private readonly httpService: HttpService) {}

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T = any>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T = any>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await lastValueFrom(
        this.httpService.request<T>({ method, url, data, ...config }),
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error.response?.data?.message || error.message || 'External API Error';
      throw new HttpException(
        createFailureResponse({ message }, 'EXTERNAL_API_ERROR'),
        status,
      );
    }
  }
}
