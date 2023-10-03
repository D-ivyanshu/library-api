import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Book } from './schemas/book.schema';
import { UpdateBookDto } from './dto/update-book.dto';
import { Query } from 'express-serve-static-core';
import { User } from '../auth/schema/user.schema';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name)
    private bookModel: mongoose.Model<Book>,
  ) {}

  async findAll(query: Query): Promise<Book[]> {
    const keyword = query.keyword
      ? {
          title: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};
    const books = await this.bookModel.find({ ...keyword });
    return books;
  }

  async findById(id: string): Promise<Book> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new HttpException(`Id is not valid`, HttpStatus.BAD_REQUEST);
    }

    const book = await this.bookModel.findById(id);
    if (!book) {
      throw new HttpException(
        `Book not found with id: #${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return book;
  }

  async create(book: Book, user: User): Promise<Book> {
    const data = Object.assign(book, { user: user._id });
    const res = await this.bookModel.create(data);
    return res;
  }

  async updateById(id: string, body: UpdateBookDto): Promise<Book> {
    const newBook = await this.bookModel.findByIdAndUpdate(id, body, {
      new: true,
    });
    return newBook;
  }

  async removeById(id: string): Promise<Book> {
    const book = await this.bookModel.findByIdAndRemove(id);
    return book;
  }
}
