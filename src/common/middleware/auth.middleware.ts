import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    const expected = this.configService.get<string>('apiKey');
    if (!apiKey || apiKey !== expected) {
      throw new ForbiddenException('Invalid API key');
    }
    next();
  }
}
