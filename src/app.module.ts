import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MailerModule } from '@nestjs-modules/mailer'
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'
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
    MailerModule.forRoot({
      transport: `smtps://${process.env.SMTP_USER}:${process.env.SMTP_PASSWORD}@${process.env.SMTP_HOST}`,
      defaults: {
        from: `"no reply" <${process.env.SMTP_USER}>`,
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
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
      sync: { force: true },
    }),
    UserModule,
    AuthModule,
    MailerModule,
  ],
})
export class AppModule {}
