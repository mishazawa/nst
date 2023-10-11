import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import * as argon from 'argon2';

import { AuthDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signIn({ email, password }: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('Credentials error.');
    }
    const pwdMatch = await argon.verify(user.hash, password);

    if (!pwdMatch) {
      throw new BadRequestException('Credentials error.');
    }
    return this.signToken(user.id, user.email);
  }

  async signUp({ email, password }: AuthDto) {
    const hash = await argon.hash(password);

    const user = await this.prisma.user
      .create({
        data: {
          email,
          hash,
        },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            throw new ForbiddenException('Credentials taken.');
          }
        }
        throw err;
      });

    return this.signToken(user.id, user.email);
  }

  async signToken(sub: number, email: string) {
    const secret = this.config.get('JWT_SECRET');
    const access_token = await this.jwt.signAsync(
      { sub, email },
      {
        expiresIn: '15m',
        secret,
      },
    );
    return {
      access_token,
    };
  }
}
