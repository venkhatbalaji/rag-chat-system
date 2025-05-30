import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpServiceWrapper } from '../http/http.service';
import { Response } from 'express';

@Injectable()
export class DeepseekService {
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpServiceWrapper,
  ) {
    this.baseUrl = this.config.get<string>('generator.deepSeekUrl');
  }

  async generate(
    prompt: string,
    response: Response,
    sessionId: string,
  ): Promise<{ finalAnswer: string; chunks: any[] }> {
    const chunks: any[] = [];
    let finalAnswer = '';

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    return new Promise((resolve) => {
      this.http.streamPost(
        `${this.baseUrl}/api/generate`,
        { model: 'deepseek-coder', prompt, stream: true },
        (chunk) => {
          const token = chunk.toString();
          finalAnswer += token;

          const message = {
            model: 'deepseek-coder',
            created_at: new Date().toISOString(),
            content: token,
          };
          chunks.push(message);
          response.write(
            `data: ${JSON.stringify({ delta: { content: token }, sessionId })}\n\n`,
          );
        },
        () => {
          response.end();
          resolve({ finalAnswer: finalAnswer.trim(), chunks });
        },
        (err) => {
          response.write(
            `data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`,
          );
          response.end();
          resolve({ finalAnswer: '', chunks: [] });
        },
      );
    });
  }
}
