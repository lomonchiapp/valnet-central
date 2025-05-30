export var EstadoTicket;
(function (EstadoTicket) {
    EstadoTicket["ABIERTO"] = "Abierto";
    EstadoTicket["CERRADO"] = "Cerrado";
    EstadoTicket["RESPONDIDO"] = "Respondido";
})(EstadoTicket || (EstadoTicket = {}));
export var Prioridad;
(function (Prioridad) {
    Prioridad["BAJA"] = "Baja";
    Prioridad["MEDIA"] = "Media";
    Prioridad["ALTA"] = "Alta";
})(Prioridad || (Prioridad = {}));
export var TipoTicket;
(function (TipoTicket) {
    TipoTicket["AVERIA"] = "Aver\u00EDa";
    TipoTicket["REPARACION"] = "Reparaci\u00F3n";
    TipoTicket["FACTURACION"] = "Facturaci\u00F3n";
    TipoTicket["CONSULTA"] = "Consulta";
    TipoTicket["OTRO"] = "Otro";
    TipoTicket["INSTALACION"] = "Instalaci\u00F3n";
    TipoTicket["DESINSTALACION"] = "Desinstalaci\u00F3n";
    TipoTicket["CAMBIO_DE_PLAN"] = "Cambio de plan";
})(TipoTicket || (TipoTicket = {}));
export var Departamento;
(function (Departamento) {
    Departamento["SAC"] = "Servicio al Cliente";
    Departamento["COORDINACION"] = "Coordinaci\u00F3n";
    Departamento["ADMINISTRACION"] = "Administraci\u00F3n";
    Departamento["CONTABILIDAD"] = "Contabilidad";
    Departamento["MARKETING"] = "Marketing";
})(Departamento || (Departamento = {}));
export var Source;
(function (Source) {
    Source["CHATBOT"] = "Chatbot";
    Source["WEB"] = "Web";
    Source["WHATSAPP"] = "Whatsapp";
    Source["EMAIL"] = "Email";
    Source["TELEFONO"] = "Tel\u00E9fono";
    Source["OTRO"] = "Otro";
})(Source || (Source = {}));
export var Turno;
(function (Turno) {
    Turno["MA\u00D1ANA"] = "Ma\u00F1ana";
    Turno["TARDE"] = "Tarde";
})(Turno || (Turno = {}));
