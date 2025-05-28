import {
  Controller,
  Get,
  HttpStatus,
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
      httpOnly: true,
      secure: this.config.get<string>('env') === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 1000,
    });
    return res.redirect(`http://localhost:3000/?token=${token}`);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get logged in user profile' })
  @ApiResponse({ status: 200, description: 'Returns user info from token' })
  async getProfile(@Req() req: Request) {
    return {
      user: req.user,
    };
  }
}
