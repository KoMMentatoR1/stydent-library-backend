import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { User } from './models/User.model'
import { Book } from './models/Book.model'
import { BookHistory } from './models/BookHistory.model'
import { Genre } from './models/Genre.model'
import { Author } from './models/Author.model'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '145415',
      database: process.env.DB_NAME || 'stydentLibrary',
      models: [User, Book, BookHistory, Genre, Author],
      autoLoadModels: true,
    }),
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
