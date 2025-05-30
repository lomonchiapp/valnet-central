import { BaseModel } from '../baseModel'

export enum RoleUsuario {
  ADMIN = 'Admin',
  TECNICO_LIDER = 'Técnico Líder',
  COORDINADOR = 'Coordinador',
  INVENTARIO = 'Inventario',
  CONTABILIDAD = 'Contabilidad',
  TECNICO = 'Técnico',
  VENDEDOR = 'Vendedor',
  SAC = 'Servicio al Cliente',
}

export enum StatusUsuario {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  ON_BREAK = 'En Pausa',
  BUSY = 'Ocupado',
}

export enum NivelVendedor {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  DIAMOND = 'Diamond',
}

export interface Usuario extends BaseModel {
  nombres: string
  apellidos: string
  email: string
  avatar: string
  role: RoleUsuario
  cedula: string
  status: StatusUsuario
  telefono: string
  direccion: string
  fechaNacimiento: string
  //campos para tecnicos
  brigadaId?: string
  //campos para vendedores
  nivelVendedor?: NivelVendedor
  contratosMes?: number
  bonoExtra?: boolean
}
