import { IRole } from 'src/models/User.model'

export class OutputUserDto {
  readonly id: number
  readonly email: string
  readonly isActivated: boolean
  readonly role: IRole

  constructor(model) {
    this.email = model.email
    this.id = model.id
    this.isActivated = model.isActivated
    this.role = model.role
  }
}
