import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { GoogleUserDto } from './dto/google.user.dto';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly redisService: RedisService,
  ) {}

  async generateToken(user: any): Promise<string> {
    const payload = {
      sub: user.providerId || user._id,
      email: user.email,
    };
    const token = await this.jwtService.signAsync(payload);
    await this.redisService.set(`session:${payload.sub}`, user);
    await this.redisService.expire(`session:${payload.sub}`, 86400);
    return token;
  }

  async signIn(user: GoogleUserDto): Promise<string> {
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userExists = await this.userModel.findOne({ email: user.email });
    if (!userExists) {
      const newUser = await this.userModel.create({
        email: user.email,
        name: user.name,
        picture: user.picture,
        provider: user.provider,
        providerId: user.providerId,
      });
      return this.generateToken({
        sub: newUser._id,
        email: newUser.email,
        avatarUrl: user.picture,
        provider: user.provider,
        providerId: user.providerId,
        name: user.name,
      });
    }

    return this.generateToken({
      sub: userExists.id,
      email: userExists.email,
      avatarUrl: user.picture,
      provider: user.provider,
      providerId: user.providerId,
      name: user.name,
    });
  }

  async logout(userId: string, provider: string): Promise<void> {
    const sessionKey = `session:${userId}:${provider}`;
    const result = await this.redisService.delete(sessionKey);
    if (!result) {
      throw new UnauthorizedException(
        'User session not found or already logged out',
      );
    }
  }
}
