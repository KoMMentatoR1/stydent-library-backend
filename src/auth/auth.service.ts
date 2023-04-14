import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/user/user.service'
import { CreateUserDto } from '../user/dto/createUser.dto'
import { SwitchPassDto } from './dto/switchPass.dto'
import * as bcrypt from 'bcrypt'
import { User } from 'src/models/user.model'
import { LoginDto } from './dto/login.dto'
import { TokenService } from 'src/token/token.service'
import { OutputUserDto } from './dto/outputUser.dto'
import { MailService } from 'src/mail/mail.service'
import * as uuid from 'uuid'
import { newPassDto } from './dto/newPass.dto'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly tokenService: TokenService,
    private mailService: MailService
  ) {}

  async registration(userDto: CreateUserDto) {
    const candidate = await this.userService.getUserByEmail(userDto.email)
    if (candidate) {
      throw new HttpException(
        'Пользователь с таким email существует',
        HttpStatus.BAD_REQUEST
      )
    }
    const hashPassword = await bcrypt.hash(userDto.password, 5)
    const activationLink = uuid.v4()
    const user = await this.userService.createUser({
      ...userDto,
      password: hashPassword,
      activationLink,
    })

    this.mailService.sendActivation(user.email, user.activationLink)

    return this.generateToken(user)
  }

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
        isActivated: user.isActivated,
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

  async forgotPass(email: string) {
    const user = await this.userService.getUserByEmail(email)
    if (!user)
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND)
    const key = `f${(~~(Math.random() * 1e8)).toString(16)}`
    await user.update({ switchKey: key })
    await this.mailService.sendSwitchPasswordCodeMail(email, key)

    return
  }

  async newPass(dto: newPassDto) {
    const user = await this.userService.getUserByCode(dto.code)
    if (!user) throw new HttpException('Неверный код', HttpStatus.NOT_FOUND)

    user.switchKey = null
    const hashPassword = await bcrypt.hash(dto.newPass, 3)

    await user.update({ password: hashPassword, switchKey: null })

    const userDto = new OutputUserDto(user)
    const tokens = await this.generateToken(user)

    return {
      ...tokens,
      user: userDto,
    }
  }

  async refresh(authorization: string) {
    try {
      const decoded = await this.tokenService.getDataFromToken(authorization)

      const user = await this.userService.getUserById(decoded.id)
      if (user.isActivated != decoded.isActivated) {
        decoded.isActivated = user.isActivated
      }

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
