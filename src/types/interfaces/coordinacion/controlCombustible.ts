import { BaseModel } from "../baseModel";

export interface ControlCombustible extends BaseModel {
    fecha: string;
    galones:number;
    precio_galon:number;
    km_inicial:number;
    km_final:number;
    idbrigada:string;
    referencia:string;
}