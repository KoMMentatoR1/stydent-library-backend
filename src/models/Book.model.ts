import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { Author } from './Author.model'
import { Genre } from './Genre.model'

@Table({ tableName: 'Book', timestamps: false, freezeTableName: true })
export class Book extends Model {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  title: string

  @Column({ type: DataType.TEXT, unique: true, allowNull: false })
  description: string

  @ForeignKey(() => Author)
  @Column
  authorId: number

  @BelongsTo(() => Author, 'authorId')
  author: Author

  @ForeignKey(() => Genre)
  @Column
  genreId: number

  @BelongsTo(() => Genre, 'genreId')
  genre: Genre
}
