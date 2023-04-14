import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNumber, IsString } from 'class-validator'

export class UpdateUserDto {
  @ApiProperty({ example: 5, description: 'ID пользователя' })
  @IsNumber({}, { message: 'Должно быть числом' })
  id: number
  @ApiProperty({ example: 'user@mail.ru', description: 'Почта' })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly login: string
}
