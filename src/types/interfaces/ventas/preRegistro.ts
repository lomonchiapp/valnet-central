import { BaseModel } from "../baseModel"

// Esto no posee el mejor codigo, pero tenemos que adaptarnos a los atributos
// de mikrowisp..

export interface PreRegistroMikrowisp {
    token: string //Acceso a api [REQUERIDO]
    cliente: string //id del cliente [REQUERIDO]
    cedula: string //cedula del cliente [REQUERIDO]
    direccion: string // direccion del cliente [REQUERIDO]
    telefono: string //telefono del cliente [REQUERIDO]
    movil: string //movil del cliente [REQUERIDO]
    email: string //email del cliente [REQUERIDO]
    notas: string
    fecha_instalacion: string
}


export interface PreRegistro extends PreRegistroMikrowisp, BaseModel {
    clienteReferencia: string
    fotoCedula: string
    fotoContrato: string[]   
}

export function extractMikrowisp(preRegistro: PreRegistro): PreRegistroMikrowisp {
    return {
        token: preRegistro.token,
        cliente: preRegistro.cliente,
        cedula: preRegistro.cedula,
        direccion: preRegistro.direccion,
        telefono: preRegistro.telefono,
        movil: preRegistro.movil,
        email: preRegistro.email,
        notas: preRegistro.notas,
        fecha_instalacion: preRegistro.fecha_instalacion,
    }
}
