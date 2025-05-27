import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: {
    userId: string;
    email: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
