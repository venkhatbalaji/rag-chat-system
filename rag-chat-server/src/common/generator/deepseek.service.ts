import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpServiceWrapper } from '../http/http.service';

@Injectable()
export class DeepseekService {
  private readonly baseUrl: string;
  constructor(
    private readonly cofig: ConfigService,
    private readonly http: HttpServiceWrapper,
  ) {
    this.baseUrl = this.cofig.get<string>('generator.deepSeekUrl');
  }

  async generate(prompt: string): Promise<string> {
    const res = await this.http.post(`${this.baseUrl}/api/generate`, {
      model: 'deepseek-coder',
      prompt,
      stream: true,
    });
    return res.data.response;
  }
}
