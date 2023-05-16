import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/user/user.service'
import { CreateUserDto } from '../user/dto/createUser.dto'
import * as bcrypt from 'bcrypt'
import { User } from 'src/models/user.model'
import { LoginDto } from './dto/login.dto'
import { TokenService } from 'src/token/token.service'
import { OutputUserDto } from './dto/outputUser.dto'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly tokenService: TokenService
  ) {}

  private async generateToken(user: User) {
    const payload = {
      email: user.email,
      id: user.id,
      role: user.role,
    }
    return {
      token: this.jwtService.sign(payload, { secret: process.env.PRIVATE_KEY }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }
  }

  private async validateUser(userDto: LoginDto) {
    const user = await this.userService.getUserByEmail(userDto.email)
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    const isPasswordEquals = await bcrypt.compare(
      userDto.password,
      user.password
    )
    if (user && isPasswordEquals) {
      return user
    }
    throw new UnauthorizedException({
      message: 'Некорректный емайл или пароль',
    })
  }

  async login(userDto: LoginDto) {
    const user = await this.validateUser(userDto)
    return this.generateToken(user)
  }

  async refresh(authorization: string) {
    try {
      const decoded = await this.tokenService.getDataFromToken(authorization)

      const user = await this.userService.getUserById(decoded.id)

      if (user.role != decoded.role) {
        decoded.role = user.role
      }
      const tokens = await this.generateToken(user)

      return {
        ...tokens,
        user: {
          ...new OutputUserDto(decoded),
        },
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_GATEWAY)
    }
  }
}
