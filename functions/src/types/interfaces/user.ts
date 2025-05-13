import { UserRole } from "../enums"

export interface User {
  id: string
  firstName: string
  lastName: string
  phone: string
  role: UserRole
  email: string
}
