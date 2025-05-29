import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { createFailureResponse } from '../utils/response.util';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

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
  streamPost(
    url: string,
    data: any,
    onData: (chunk: Buffer) => void,
    onEnd: () => void,
    onError: (err: Error) => void,
  ) {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const reqModule = isHttps ? https : http;

    const req = reqModule.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
      },
      (res) => {
        res.on('data', onData);
        res.on('end', onEnd);
      },
    );

    req.on('error', onError);
    req.write(JSON.stringify(data));
    req.end();
  }
}
