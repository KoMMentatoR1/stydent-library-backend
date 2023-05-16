import { Column, DataType, Model, Table } from 'sequelize-typescript'

export enum IRole {
  ADMIN = 'ADMIN',
  LIBRARIAN = 'LIBRARIAN',
  USER = 'USER',
}

@Table({ tableName: 'User', timestamps: false, freezeTableName: true })
export class User extends Model {
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
  lastName: string

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  phoneNumber: string

  @Column({ type: DataType.STRING, allowNull: false })
  password: string

  @Column({
    type: DataType.ENUM('ADMIN', 'LIBRARIAN', 'USER'),
    allowNull: true,
    defaultValue: 'USER',
  })
  role: IRole
}
