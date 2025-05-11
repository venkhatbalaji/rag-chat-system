import { Injectable } from '@nestjs/common';

@Injectable()
export class GeneratorService {
  async streamReply(
    input: { prompt: string; history?: string; sources?: string },
    onChunk: (chunk: string) => Promise<void> | void,
  ) {
    const combinedPrompt = `The requested answer for ${input.prompt}`;
    const tokens = combinedPrompt.split(' ');
    for (const token of tokens) {
      await onChunk(token + ' ');
      await this.delay(30);
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
