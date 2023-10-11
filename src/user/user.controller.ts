import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { User as UserId } from 'src/auth/decorator';

import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  asd(@UserId() user: User) {
    return user;
  }
}
