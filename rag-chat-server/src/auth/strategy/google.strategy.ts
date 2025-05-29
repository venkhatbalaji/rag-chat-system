import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { GoogleUserDto } from '../dto/google.user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('google.clientId'),
      clientSecret: configService.get<string>('google.clientSecret'),
      callbackURL: configService.get<string>('google.callbackUrl'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    if (!profile) {
      throw new NotFoundException('No profile returned from Google');
    }
    const { id, name, emails, photos } = profile;
    const user: GoogleUserDto = {
      providerId: id,
      email: emails?.[0]?.value,
      name: name?.givenName,
      picture: photos?.[0]?.value,
      provider: profile?.provider,
      accessToken: _accessToken,
      refreshToken: _refreshToken,
    };
    done(null, user);
  }
}
