import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNumber, IsString, Length } from 'class-validator'

export class SwitchPassDto {
    @IsNumber({}, { message: 'Должно быть числом' })
    readonly id: number
    @ApiProperty({ example: 'example@example.com', description: 'email' })
    @IsEmail({}, { message: 'должно быть почтой' })
    @IsString({ message: 'Должно быть строкой' })
    readonly email: string
    @ApiProperty({ example: '12345', description: 'пароль' })
    @Length(4, 16, { message: 'пароль от 4 до 16 символов' })
    @IsString({ message: 'Должно быть строкой' })
    readonly newPassword: string
    @IsString({ message: 'Должно быть строкой' })
    @Length(4, 16, { message: 'Не меньше 4 и не больше 16' })
    readonly password: string
}
