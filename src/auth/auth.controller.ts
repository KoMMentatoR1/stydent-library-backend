import { Body, Controller, Get, Headers, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from '../user/dto/createUser.dto'
import { LoginDto } from './dto/login.dto'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { User } from 'src/models/user.model'

@ApiBearerAuth('JWT')
@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}

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
}
