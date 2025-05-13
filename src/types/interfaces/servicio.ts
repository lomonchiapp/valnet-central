import { Coordenadas } from "./coordinacion/brigada"
import { BaseModel } from "./baseModel"
import { Cliente } from "./valnet/cliente"

export interface ServicioMikrowisp{
    id: string
    idperfil: string
    nodo: string
    costo: number
    ipap: string
    mac: string
    ip: string
    instalado: string
    pppuser: string
    ppppass: string
    tiposervicio: TipoServicio
    status_user: string
    coordenadas: Coordenadas
    direccion: string
    snmp_comunidad: string
    perfil: string

}

export interface Servicio extends ServicioMikrowisp, BaseModel {
    cliente: Cliente
}

export enum TipoServicio {
    WIFI = "WIFI",
    CABLE = "CABLE",
    FIBRA = "FIBRA"
}
