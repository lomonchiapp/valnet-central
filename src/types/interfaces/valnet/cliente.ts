import { BaseModel } from "../baseModel"
import { ServicioMikrowisp } from "../servicio"
export enum EstadoCliente {
    ACTIVO = 'ACTIVO',
    INACTIVO = 'INACTIVO',
    SUSPENDIDO = 'SUSPENDIDO',
    CANCELADO = 'CANCELADO',
    BLOQUEADO = 'BLOQUEADO',
    EXPIRADO = 'EXPIRADO',
}

export interface ClienteMikrowisp {
    id: string // id de mikrowisp
    nombre: string //el vago de mikrowisp lo junto todo
    estado: EstadoCliente //Estado de facturacion
    direccion_principal: string
    codigo: string //codigo de usuario para acceder a su mikroWisp
    correo: string
    movil: string 
    telefono: string
    cedula: string

}

export interface Cliente extends ClienteMikrowisp, BaseModel {
    direccion: string
    barrio: string
    municipio: string
    departamento: string
    servicios: ServicioMikrowisp[]
    codigo: string //codigo de usuario para acceder a su mikroWisp
}
