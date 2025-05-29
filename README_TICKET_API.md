# Ticket API - Especificación para Integración Chatbot

# https://newticket-2bdzrtuy2a-uc.a.run.app/

## Descripción
El chatbot debe enviar un **JSON** para crear un ticket en el sistema. Este documento describe la estructura exacta, los valores permitidos y ejemplos para evitar dudas o errores.

---

## Estructura del JSON - METHOD POST

```json
{
  "tipo": "Avería",
  "cedula": "00123456789",
  "solicitante": "Juan Pérez",
  "asunto": "Internet lento",
  "estado": "Abierto",
  "dp": "Coordinación",
  "turno": "Tarde",
  "source": "Chatbot",
  "fecha": "2024-05-28T14:00:00Z",
  "prioridad": "Alta",
  // Opcionales:
  "idcliente": "123",
  "fechavisita": "2024-05-29T10:00:00Z",
  "motivo_cierre": "Resuelto por el cliente",
  "idbrigada": "ads123412ABcsDe312D"
}
```

---

## Campos requeridos

| Campo        | Tipo    | Descripción                                      | Valores permitidos (enums) |
|--------------|---------|--------------------------------------------------|----------------------------|
| tipo         | string  | Tipo de ticket                                   | "Avería", "Reparación", "Consulta",
                                                                            "Otro","Instalación", "Desinstalación", 
                                                                            "Cambio de plan", "Facturación" |
| cedula       | string  | Cédula del cliente                               | -                          |
| solicitante  | string  | Nombre del cliente                               | -                          |
| asunto       | string  | Asunto del ticket                                | -                          |
| estado       | string  | Estado del ticket                                | "Abierto", "Cerrado", "Respondido" |
| dp           | string  | Departamento                                     | "Servicio al Cliente", "Coordinación", "Administración", "Contabilidad", "Marketing" (el chatbot siempre envia a Servicio al Cliente) |
| turno        | string  | Tanda                                            | "Mañana", "Tarde"         |
| source       | string  | Por dónde fue agendado                           | "Chatbot", "Web", "Whatsapp", "Email", "Teléfono", "Otro" (Chatbot) |
| fecha        | string  | Fecha de creación (formato ISO 8601)             | -                          |
| prioridad    | string  | Prioridad del ticket                             | "Baja", "Media", "Alta"   |


## Puedes ignorar estos campos

| Campo         | Tipo    | Descripción                                      |
|---------------|---------|--------------------------------------------------|
| idcliente     | string  | ID del cliente en mikrowisp                      |
| fechavisita   | string  | Fecha y hora de la visita (formato ISO 8601)     |
| motivo_cierre | string  | Motivo del cierre del ticket                     |
| idbrigada     | string  | ID de la brigada asignada (si aplica)            |


---

## Notas importantes

- **Todos los valores de campos deben coincidir exactamente** (mayúsculas, acentos y espacios).
- **Usar Metodo POST**
- Los campos marcados como opcionales pueden omitirse o enviarse como `null` o string vacío.
- Las fechas deben ir en formato ISO 8601 (`YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ssZ`). 
    (puede usar directamente new Date().toString si su equipo trabaja en JS, 
    usar datetime python, o equivalente)

---

## Ejemplo completo

```json
{
    "cedula": "00123456789",
  "solicitante": "Juan Pérez",
  "tipo": "Avería", //Categoria del ticket
  "asunto": "Internet lento",
  "estado": "Abierto", // Un ticket siempre inicia Abierto
  "dp": "Servicio al Cliente", //El chatbot siempre debe enviar a Servicio al Cliente
  "turno": "Tarde", // Mañana o Tarde
  "source": "Chatbot",
  "fecha": "2024-05-28T14:00:00Z", //Generado con el metodo new Date()
  "prioridad": "Alta", // Baja, Media, Alta. 
  "idcliente": "123" //(Opcional) En caso de necesitar para query anidado.
}
``` 