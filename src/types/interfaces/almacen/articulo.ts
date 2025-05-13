import { BaseModel } from "../baseModel"


export enum Unidad {
    UNIDAD = 'UNIDAD',
    PAQUETE = 'PAQUETE',
    KILO = 'KILO',
    METRO = 'METRO',
    LITRO = 'LITRO',
    CENTIMETRO = 'CENTIMETRO',
}

export enum TipoArticulo {
    EQUIPO = 'EQUIPO',
    MATERIAL = 'MATERIAL',
    
}

export interface Articulo extends BaseModel {
    tipo: TipoArticulo
    idinventario: string
    nombre: string
    descripcion: string
    //parametros para materiales
    cantidad: number
    costo: number //costo unitario
    unidad: Unidad
    modelo:string
    //parametros para equipos
    marca: string
    serial: string
    ubicacion: string
}
