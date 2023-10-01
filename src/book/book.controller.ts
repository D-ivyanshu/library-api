import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async findAll(@Query() query: ExpressQuery): Promise<Book[]> {
    return this.bookService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.bookService.findById(id);
  }

  @Post()
  async createBook(@Body() body: CreateBookDto) {
    return this.bookService.create(body);
  }

  @Patch(':id')
  async updateBook(@Param('id') id: string, @Body() body: UpdateBookDto) {
    return this.bookService.updateById(id, body);
  }

  @Delete(':id')
  async removeBook(@Param('id') id: string) {
    return this.bookService.removeById(id);
  }
}
