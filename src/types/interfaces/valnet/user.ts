import { BaseModel } from "../baseModel";

export enum RoleUsuario {
  ADMIN = 'Admin',
  CLIENTE = 'Cliente',
  TECNICO_LIDER = 'Técnico Líder',
  COORDINADOR = 'Coordinador',
  INVENTARIO = 'Inventario',
  CONTABILIDAD = 'Contabilidad',
  TECNICO = 'Técnico',
  VENDEDOR = 'Vendedor',
  SAC = 'Servicio al Cliente',
}

export interface Usuario extends BaseModel {
  nombre: string;
  activo?: boolean;
  email: string;
  role: RoleUsuario;
  cedula: string;
  telefono: string;
  direccion: string;  
  fechaNacimiento: string;
  //campos para tecnicos
  brigadaId?: string;
}
