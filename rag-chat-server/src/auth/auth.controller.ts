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
import { Response } from 'express';
import { GoogleUserDto } from './dto/google.user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      maxAge: 86400,
      sameSite: true,
      secure: false,
    });
    return res.status(HttpStatus.OK);
  }
}
