import { BaseModel } from "../baseModel"

export interface GastoMenor extends BaseModel {
    descripcion: string
    monto: number
    fecha: Date
    responsable: string
  }