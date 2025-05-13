import { BaseModel } from "../baseModel"
import { Brigada } from "./brigada"

export interface TicketMikrowisp {
    id: string
    idcliente: string
    asunto: string
    fecha_soporte: string
    estado: string
    solicitante: string
    fechavisita: string
    dp: string // Deparatamento
    turno: string // tanda Tarde o Mañana
    agendado: string // por donde fue agendado
    lastdate: string
    motivo_cierre: string
    fecha: Date
    hora: Date
}

export enum Prioridad {
    BAJA = "Baja",
    MEDIA = "Media",
    ALTA = "Alta"
}

export interface Ticket extends TicketMikrowisp, BaseModel {
    brigada: Brigada
    prioridad: Prioridad
}


