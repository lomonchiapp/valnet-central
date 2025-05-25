import { BaseModel } from "../baseModel";

export enum TipoMovimiento {
    ENTRADA = "ENTRADA",
    TRANSFERENCIA = "TRANSFERENCIA",
    SALIDA = "SALIDA",
}

export interface Movimiento extends BaseModel {
    idinventario_origen?: string;
    idinventario_destino?: string;
    idusuario: string;
    idarticulo: string;
    cantidad: number;
    tipo: TipoMovimiento;
    fecha: Date;
    descripcion: string;
}

