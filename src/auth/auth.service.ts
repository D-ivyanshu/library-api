import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(
    signUpDto: SignUpDto,
    res: Response,
  ): Promise<{ message: string }> {
    const { name, email, password } = signUpDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
    const token = this.jwtService.sign({ id: user._id });
    res.cookie('user_token', token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    });

    return { message: 'Successfully Signed in' };
  }

  async login(loginDto: LoginDto, res: Response): Promise<{ message: string }> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = this.jwtService.sign({ id: user._id });
    console.log(token);
    res.cookie('user_token', token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    });

    return { message: 'Successfully logged in' };
  }

  async logout(res: Response): Promise<{ message: string }> {
    res.clearCookie('user_token');
    return { message: 'Successfully logged out' };
  }
}
