import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { CreateUserDto } from './dto/createUser.dto'
import { IRole, User } from 'src/models/User.model'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User
  ) {}

  async createUser(dto: CreateUserDto) {
    const hashPassword = await bcrypt.hash(this.generatePassword(), 5)
    const user = await this.userModel.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      password: hashPassword,
    })

    return user
  }
  async setRole(id: number, role: IRole) {
    const user = await this.userModel.findByPk(id)
    if (!user) {
      throw new HttpException('Пользователь не найдена', HttpStatus.NOT_FOUND)
    }
    user.role = role
    await user.save()
    return user
  }

  async getAll() {
    const users = await this.userModel.findAll({ include: { all: true } })
    return users
  }

  async getUsersData() {
    const users = await this.userModel.findAll()
    return users
  }

  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({
      where: { email },
    })

    return user
  }

  async getUserById(id: number) {
    const user = await this.userModel.findByPk(id)
    if (user) return user
    throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND)
  }

  async deleteUser(id: number) {
    await this.userModel.destroy({ where: { id } })
  }

  async generateAdmin() {
    const hashPassword = await bcrypt.hash('admin', 5)
    const user = await this.userModel.create({
      firstName: 'admin',
      lastName: 'admin',
      email: 'admin',
      phoneNumber: '00000000',
      password: hashPassword,
      role: IRole.ADMIN,
    })
    return true
  }

  generatePassword() {
    var length = 8,
      charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      retVal = ''
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n))
    }
    return retVal
  }
}
