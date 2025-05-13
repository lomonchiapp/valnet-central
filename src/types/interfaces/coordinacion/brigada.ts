import { BaseModel } from "../baseModel"

export interface Coordenadas {
    lat: number
    lng: number
}

export interface Brigada extends BaseModel {
    nombre: string
    matricula: string
    inventarioId: string
    coordenadas: Coordenadas
}

