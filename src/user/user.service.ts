import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(id: number, dto: EditUserDto) {
    return await this.prisma.user.update({ where: { id }, data: dto });
  }
}
