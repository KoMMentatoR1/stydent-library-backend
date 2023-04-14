import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'
import { Book } from './Book.model'

@Table({ tableName: 'Author', timestamps: false, freezeTableName: true })
export class Author extends Model {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.STRING, allowNull: false })
  firstName: string

  @Column({ type: DataType.STRING, allowNull: false })
  latsName: string

  @HasMany(() => Book)
  books: Book[]
}
