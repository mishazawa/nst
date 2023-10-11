import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign_in')
  signIn(@Body() dto: AuthDto) {
    return this.auth.signIn(dto);
  }

  @Post('sign_up')
  signUp(@Body() dto: AuthDto) {
    return this.auth.signUp(dto);
  }
}
