import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { User } from '../auth/decorator';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmark: BookmarkService) {}

  @Get()
  getList(@User('id') id: number) {
    return this.bookmark.getList(id);
  }

  @Get(':id')
  getById(@User('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.bookmark.getById(userId, id);
  }

  @Post()
  create(@User('id') userId: number, @Body() data: CreateBookmarkDto) {
    return this.bookmark.create(userId, data);
  }

  @Patch(':id')
  editById(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() data: UpdateBookmarkDto,
  ) {
    return this.bookmark.update(userId, bookmarkId, data);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  removeById(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmark.remove(userId, bookmarkId);
  }
}
