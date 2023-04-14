import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { AuthModule } from 'src/auth/auth.module'
import { MailModule } from 'src/mail/mail.module'
import { UserController } from './user.controller'
import { User } from '../models/user.model'
import { UserService } from './user.service'
import { TokenModule } from 'src/token/token.module'

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [
    SequelizeModule.forFeature([User]),
    MailModule,
    AuthModule,
    TokenModule,
  ],
})
export class UserModule {}
