import { BaseModel } from "../baseModel"
import { Cliente } from "../valnet/cliente"

export enum EstadoFactura {
    PAGADA = 'Pagada',
    NO_PAGADA = 'No Pagada',
    ANULADA = 'Anulada',
}

export interface FacturaMikrowisp {
    id: string
    legal: number
    idcliente: string
    emitido: string
    vencimiento: string
    total: number
    estado: string
    cobrado: number
    impuesto: number
    barcode_cobro_digital: string
    fechapago: string
    subtotal: number
    subtotal2: number
    total2: number
    impuesto2: number
    formapago: string
}

export interface Factura extends FacturaMikrowisp, BaseModel {
    cliente: Cliente
}
