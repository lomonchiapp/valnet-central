import { BaseModel } from '../baseModel'

export enum EstadoTicket {
  ABIERTO = 'Abierto',
  CERRADO = 'Cerrado',
  RESPONDIDO = 'Respondido',
}

export enum Prioridad {
  BAJA = 'Baja',
  MEDIA = 'Media',
  ALTA = 'Alta',
}

export enum TipoTicket {
  AVERIA = 'Avería',
  REPARACION = 'Reparación',
  FACTURACION = 'Facturación',
  CONSULTA = 'Consulta',
  OTRO = 'Otro',
  INSTALACION = 'Instalación',
  DESINSTALACION = 'Desinstalación',
  CAMBIO_DE_PLAN = 'Cambio de plan',
}

export enum Departamento {
  SAC = 'Servicio al Cliente',
  COORDINACION = 'Coordinación',
  ADMINISTRACION = 'Administración',
  CONTABILIDAD = 'Contabilidad',
  MARKETING = 'Marketing',
}

export enum Source {
  CHATBOT = 'Chatbot',
  WEB = 'Web',
  WHATSAPP = 'Whatsapp',
  EMAIL = 'Email',
  TELEFONO = 'Teléfono',
  OTRO = 'Otro',
}

export enum Turno {
  MAÑANA = 'Mañana',
  TARDE = 'Tarde',
}

export interface Ticket extends BaseModel {
  tipo: TipoTicket
  cedula: string // cedula del cliente
  solicitante: string // nombre del cliente
  idcliente?: string // id del cliente de mikrowisp
  asunto: string //
  estado: EstadoTicket
  fechavisita?: Date
  dp: Departamento // Deparatamento
  turno: Turno // tanda Tarde o Mañana
  source: Source // por donde fue agendado
  motivo_cierre?: string
  fecha: Date
  prioridad: Prioridad
  //Si va a coordinacion, se debe asignar una brigada
  idbrigada?: string
}
