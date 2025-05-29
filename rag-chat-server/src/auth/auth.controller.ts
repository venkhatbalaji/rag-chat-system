import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { GoogleUserDto } from './dto/google.user.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Generate JWT access token' })
  @ApiResponse({
    status: 200,
    description: 'Returns a signed JWT token in cookie',
    schema: {
      example: {
        access_token: 'eyJhbGciOi...',
      },
    },
  })
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const token = await this.authService.signIn(req.user as GoogleUserDto);
    res.cookie('access_token', token, {
      domain: this.config.get<string>('domain'),
      path: '/',
      secure: this.config.get<string>('env') === 'production',
      httpOnly: true,
      sameSite: 'none',
      maxAge: 86400 * 1000,
    });
    return res.redirect(
      `${this.config.get<string>('redirectUrl')}?token=${token}`,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get logged in user profile' })
  @ApiResponse({ status: 200, description: 'Returns user info from token' })
  async getProfile(@Req() req: Request) {
    return {
      user: req.user,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout the user' })
  async logout(@Req() req: Request, @Res() res: Response) {
    const { sub: userId, provider } = req.user as GoogleUserDto;
    await this.authService.logout(userId, provider);
    return res.redirect(
      `https://appengine.google.com/_ah/logout?continue=${this.config.get<string>('redirectUrl')}`,
    );
  }
}
