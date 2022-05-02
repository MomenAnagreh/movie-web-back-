import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AuthCredentialsDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  jwtService: any;
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async signUp(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password, email, tmdb_key } = authCredentialsDto;

    // hash the password;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
      tmdb_key,
      role: UserRole.USER,
    });

    try {
      await this.userRepository.save(user);
      return { accessToken: await this.createToken(user) };
    } catch (error) {
      if (error.code === '23505') {
        // 23505 --> duplicate username
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;
    const user = await this.userRepository.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      return { accessToken: await this.createToken(user) };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  private async createToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      username: user.username,
      email: user.email,
      role: user.role,
      tmdb_key: user.tmdb_key,
    };
    /* 
        create the jwt during signUp --> jwt hold the {username} now;
        
        when send request to server --> jwt strategy will validate the jwt, 

        the validate can get the payload in the jwt, in this case --> {username}
        base on the username, validate fn can find the user from the repository;
        then return ---> user

        the getUser decorator can get the user after it from the jwtstrategy --> req.user

        in the task request, it can get this user too!
    */
    return await this.jwtService.sign(payload);
  }
}
