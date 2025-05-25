import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('activo'),
  z.literal('inactivo'),
  z.literal('invitado'),
  z.literal('suspendido'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('gerente'),
  z.literal('cajero'),
  z.literal('inventario'),
  z.literal('vendedor'),
  z.literal('soporte'),
])
export type UserRole = z.infer<typeof userRoleSchema>

const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  status: userStatusSchema,
  role: userRoleSchema,
  sucursal: z.string().optional(),
  departamento: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema) 