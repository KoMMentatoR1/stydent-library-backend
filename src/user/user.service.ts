import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { CreateUserDto } from './dto/createUser.dto'
import { IRole, User } from 'src/models/User.model'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.userModel.create({
      email: dto.email,
      password: dto.password,
      activationLink: dto.activationLink,
    })

    return user
  }
  async setRole(id: number, role: IRole) {
    const user = await this.userModel.findByPk(id)
    if (!user) {
      throw new HttpException('Пользователь не найдена', HttpStatus.NOT_FOUND)
    }
    console.log(role)

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
      include: { all: true },
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

  async getUserByCode(code: string) {
    return this.userModel.findOne({ where: { switchKey: code } })
  }

  async activate(value: string) {
    const user = await this.userModel.findOne({
      where: { activationLink: value },
    })
    if (user) {
      user.update({ isActivated: true })
      return user
    }
    throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND)
  }
}
