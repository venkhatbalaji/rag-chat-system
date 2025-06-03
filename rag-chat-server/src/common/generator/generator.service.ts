import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpServiceWrapper } from '../http/http.service';
import { Response } from 'express';
import { StreamedChunk } from './type';
import { ModelType } from '../../chat/schemas/message.schema';

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
    modelType: ModelType,
    onComplete: (finalAnswer: string, chunks: StreamedChunk[]) => Promise<void>,
  ): Promise<void> {
    let finalAnswer = '';
    const chunks: StreamedChunk[] = [];

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();
    this.http.streamPost(
      `${this.baseUrl}/api/generate`,
      { model: modelType, prompt, stream: true },
      (chunk) => {
        const token = JSON.parse(chunk.toString()) as StreamedChunk;
        chunks.push(token);
        finalAnswer += token.response;
        response.write(
          `data: ${JSON.stringify({ delta: { content: token.response }, sessionId })}\n\n`,
        );
      },
      async () => {
        response.end();
        await onComplete(finalAnswer.trim(), chunks);
      },
      (err) => {
        response.write(
          `data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`,
        );
        response.end();
      },
    );
  }
}
