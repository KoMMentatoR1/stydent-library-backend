import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Redirect,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Roles } from 'src/auth/roles-auth.decorator'
import { RolesGuard } from 'src/auth/roles.guard'
import { CreateUserDto } from './dto/createUser.dto'
import { IRole, User } from '../models/user.model'
import { UserService } from './user.service'
@ApiTags('Пользователи')
@Controller('user')
export class UserController {
  constructor(private UserService: UserService) {}

  @ApiOperation({ summary: 'Создание пользователя' })
  @ApiResponse({ status: 201, type: User })
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Post('/create')
  create(@Body() Dto: CreateUserDto) {
    return this.UserService.createUser(Dto)
  }

  @Get('/activ/:value')
  @Redirect('http://localhost:3000/login')
  async activation(@Param('value') value: string) {
    const fuser = await this.UserService.activate(value)
    return { url: 'http://localhost:3000/main' }
  }

  @ApiOperation({ summary: 'Поиск пользователя по почте' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(RolesGuard)
  @Roles('USER')
  @Post('/byemail')
  GetUserByEmail(@Body('email') email: string) {
    return this.UserService.getUserByEmail(email)
  }

  @ApiOperation({ summary: 'Удаление пользователя' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/delete/:id')
  DeleteUser(@Param('id') id: number) {
    return this.UserService.deleteUser(id)
  }

  @ApiOperation({ summary: 'Выдать роль' })
  @ApiResponse({ status: 200 })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Put('/setRole/:id')
  SetRole(@Param('id') id: number, @Body('role') role: IRole) {
    return this.UserService.setRole(id, role)
  }

  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({ status: 200, type: [User] })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('/all')
  AllPeople() {
    return this.UserService.getAll()
  }

  @ApiOperation({ summary: 'Получить все данные всех пользователей' })
  @ApiResponse({ status: 200, type: [User] })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('/allUsersData')
  AllUsersData() {
    return this.UserService.getUsersData()
  }
}
