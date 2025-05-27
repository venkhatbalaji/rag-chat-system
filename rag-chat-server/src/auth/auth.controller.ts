import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Generate JWT access token' })
  @ApiResponse({
    status: 200,
    description: 'Returns a signed JWT token',
    schema: {
      example: {
        access_token: 'eyJhbGciOi...',
      },
    },
  })
  async login(@Body() body: LoginDto) {
    const token = await this.authService.generateToken({
      userId: body.userId,
      email: body.email,
    });

    return { access_token: token };
  }
}
