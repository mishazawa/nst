import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  async getList(userId: number) {
    return this.prisma.bookmark.findMany({ where: { userId }, take: 10 });
  }

  async getById(userId: number, id: number) {
    const res = await this.prisma.bookmark.findFirst({
      where: { userId, id },
    });

    if (!res)
      throw new NotFoundException(`Bookmark with id=${id} doesn't found`);
    return res;
  }

  async create(userId: number, data: CreateBookmarkDto) {
    return this.prisma.bookmark.create({ data: { ...data, userId } });
  }

  async update(userId: number, id: number, data: UpdateBookmarkDto) {
    return this.prisma.bookmark
      .update({
        data: { ...data },
        where: { userId, id },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new NotFoundException(`Bookmark with id=${id} doesn't found`);
          }
        }
        throw err;
      });
  }

  async remove(userId: number, id: number) {
    return this.prisma.bookmark
      .delete({ where: { id, userId } })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new NotFoundException(`Bookmark with id=${id} doesn't found`);
          }
        }
        throw err;
      });
  }
}
