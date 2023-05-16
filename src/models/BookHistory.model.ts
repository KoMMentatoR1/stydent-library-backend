import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { User } from './User.model'
import { Book } from './Book.model'

export enum IStatus {
  LOST = 'LOST',
  PLACE = 'PLACE',
  PEOPLE = 'PEOPLE',
}

@Table({ tableName: 'BookHistory', timestamps: false, freezeTableName: true })
export class BookHistory extends Model {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({
    type: DataType.ENUM('LOST', 'PLACE', 'PEOPLE'),
    allowNull: true,
    defaultValue: 'LOST',
  })
  role: IStatus

  @ForeignKey(() => User)
  @Column
  userId: number

  @BelongsTo(() => User, 'userId')
  user: User

  @ForeignKey(() => Book)
  @Column
  bookId: number

  @BelongsTo(() => Book, 'bookId')
  genre: Book
}
