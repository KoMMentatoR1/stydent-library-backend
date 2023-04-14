import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'
import { Book } from './Book.model'

@Table({ tableName: 'Genre', timestamps: false, freezeTableName: true })
export class Genre extends Model {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  name: string

  @HasMany(() => Book)
  books: Book[]
}
