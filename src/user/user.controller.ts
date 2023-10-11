import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { User as UserId } from '../auth/decorator';

import { JwtGuard } from '../auth/guard';
import { UserService } from './user.service';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private user: UserService) {}
  @Get('me')
  getUserInfo(@UserId() u: User) {
    return u;
  }

  @Patch()
  editUser(@UserId('id') id: number, @Body() dto: EditUserDto) {
    return this.user.editUser(id, dto);
  }
}
