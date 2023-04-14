import { Body, Controller, Get, Headers, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from '../user/dto/createUser.dto'
import { SwitchPassDto } from './dto/switchPass.dto'
import { LoginDto } from './dto/login.dto'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { User } from 'src/models/user.model'
import { newPassDto } from './dto/newPass.dto'

@ApiBearerAuth('JWT')
@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}

  @ApiOperation({ summary: 'Создание пользователя' })
  @ApiResponse({ status: 201, type: User })
  @Post('/registration')
  reg(@Body() dto: CreateUserDto) {
    return this.AuthService.registration(dto)
  }

  @ApiOperation({ summary: 'Авторизация в аккаунт' })
  @ApiResponse({ status: 201, type: User })
  @Post('/login')
  login(@Body() dto: LoginDto) {
    return this.AuthService.login(dto)
  }

  @Get('/refresh')
  refresh(@Headers('authorization') authorization: string) {
    return this.AuthService.refresh(authorization)
  }

  @Post('/forgotPassword')
  ForgotPass(@Body('email') email: string) {
    return this.AuthService.forgotPass(email)
  }

  @Post('/newPass')
  NewPass(@Body() dto: newPassDto) {
    return this.AuthService.newPass(dto)
  }
}
