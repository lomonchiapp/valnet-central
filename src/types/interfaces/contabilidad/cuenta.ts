import { BaseModel } from "../baseModel"

export enum TipoCuentaContable {
    ACTIVO = "ACTIVO",
    PASIVO = "PASIVO",
    INGRESO = "INGRESO",
    EGRESOS = "EGRESOS",
}

export interface Cuenta extends BaseModel{
    nombre: string
    tipo: TipoCuentaContable
    descripcion: string
    balance: number
}