# Reglas de Negocio del Inventario

## Identificación de Artículos

### Materiales
Un material se identifica únicamente por la combinación de:
- **Nombre** (obligatorio)
- **Unidad de medida** (obligatorio: UNIDAD, PAQUETE, KILO, METRO, LITRO, CENTIMETRO)
- **Marca** (obligatorio)
- **Modelo** (obligatorio)

**Ejemplo:**
- "Cable Ethernet" con unidad "METRO" y marca "GENERICA" y modelo "GENERICO" = Artículo A
- "Cable Ethernet" con unidad "UNIDAD" y marca "GENERICA" y modelo "GENERICO" = Artículo B (DIFERENTE)

**Conclusión:** Dos materiales con el mismo nombre pero diferente unidad son **ARTÍCULOS DIFERENTES**.

### Equipos
Un equipo se identifica únicamente por:
- **Serial** (obligatorio, debe ser único globalmente)

**Ejemplo:**
- Equipo con serial "SN123456" = Artículo único
- No puede existir otro equipo con el mismo serial en ningún inventario

## Reglas de Creación

### Materiales
1. **Validaciones obligatorias:**
   - Nombre: 1-200 caracteres
   - Unidad: Debe ser una de las unidades válidas
   - Cantidad: ≥ 0, ≤ 999,999
   - Costo: ≥ 0, ≤ 999,999,999
   - Marca: Obligatoria
   - Modelo: Obligatorio

2. **Detección de duplicados:**
   - Si ya existe un material con el mismo nombre + unidad + marca + modelo en el mismo inventario:
     - Se suma la cantidad al material existente
     - Se actualiza con los datos más recientes (costo, descripción, etc.)
     - Se registra como una "Entrada" en el historial

3. **Creación de nuevo material:**
   - Solo se crea si NO existe otro con la misma clave completa
   - Se registra como "Entrada inicial" en el historial

### Equipos
1. **Validaciones obligatorias:**
   - Serial: 1-100 caracteres, único globalmente
   - Cantidad: Siempre debe ser 1
   - Marca: Obligatoria
   - Modelo: Obligatorio

2. **Detección de duplicados:**
   - Si ya existe un equipo con el mismo serial (en cualquier inventario):
     - **NO se puede crear** - Error: "Ya existe un equipo con el serial X"
   - El serial debe ser único en todo el sistema

## Reglas de Transferencia

### Materiales
1. **Búsqueda en destino:**
   - Se busca material con la misma clave completa (nombre + unidad + marca + modelo)
   - Si existe:
     - Se suma la cantidad transferida al material existente
     - Se actualiza la ubicación si se especifica
   - Si NO existe:
     - Se crea un nuevo material en el inventario destino
     - Se copian todos los datos del material origen

2. **Validaciones:**
   - Cantidad disponible suficiente en origen
   - Cantidad debe ser un número entero
   - Cantidad > 0

### Equipos
1. **Transferencia:**
   - Se cambia el `idinventario` del equipo al inventario destino
   - Se actualiza la ubicación si se especifica
   - Cantidad siempre = 1

2. **Validaciones:**
   - No puede existir otro equipo con el mismo serial en el inventario destino
   - El equipo debe estar disponible (cantidad ≥ 1)

## Reglas de Salida

### Materiales
1. **Validaciones:**
   - Cantidad disponible suficiente
   - Cantidad debe ser un número entero
   - Cantidad > 0

2. **Proceso:**
   - Se resta la cantidad del inventario
   - Se registra como "Salida" en el historial

### Equipos
1. **Validaciones:**
   - Cantidad = 1 (solo se puede dar salida de un equipo a la vez)
   - Equipo disponible

2. **Proceso:**
   - Se resta la cantidad (de 1 a 0)
   - Se registra como "Salida" en el historial

## Reglas de Actualización

### Materiales
1. **Validaciones:**
   - No puede crear duplicados al cambiar nombre/unidad/marca/modelo
   - Si cambia la clave completa, debe verificar que no exista otro con la nueva clave

2. **Proceso:**
   - Se valida antes de actualizar
   - Se registra como "Edición" en el historial con valores anteriores y nuevos

### Equipos
1. **Validaciones:**
   - No puede cambiar el serial a uno que ya existe
   - Cantidad siempre debe ser 1

2. **Proceso:**
   - Se valida antes de actualizar
   - Se registra como "Edición" en el historial

## Casos Especiales

### Materiales con el mismo nombre pero diferente unidad
**Ejemplo:**
- "Cable Ethernet" - 10 METROS
- "Cable Ethernet" - 5 UNIDADES

**Resultado:** Son dos artículos diferentes. Se pueden tener ambos en el mismo inventario.

### Materiales con el mismo nombre y unidad pero diferente marca/modelo
**Ejemplo:**
- "Cable Ethernet" - METROS - Marca "GENERICA" - Modelo "GENERICO"
- "Cable Ethernet" - METROS - Marca "TP-Link" - Modelo "CAT6"

**Resultado:** Son dos artículos diferentes. Se pueden tener ambos en el mismo inventario.

### Equipos con serial duplicado
**Ejemplo:**
- Equipo con serial "SN123456" en Inventario A
- Intento de crear equipo con serial "SN123456" en Inventario B

**Resultado:** Error - No se puede crear. El serial debe ser único globalmente.

## Resumen de Validaciones

### Al crear un artículo:
- ✅ Validar datos básicos (nombre, tipo, cantidad, costo, etc.)
- ✅ Buscar duplicados por clave completa
- ✅ Para materiales: Si existe duplicado, sumar cantidad
- ✅ Para equipos: Si existe duplicado, rechazar creación

### Al transferir un artículo:
- ✅ Validar cantidad disponible
- ✅ Buscar artículo en destino por clave completa
- ✅ Si existe: Sumar cantidad
- ✅ Si no existe: Crear nuevo artículo en destino
- ✅ Para equipos: Verificar que no exista serial duplicado en destino

### Al actualizar un artículo:
- ✅ Validar datos básicos
- ✅ Verificar que no se cree duplicado con la nueva clave
- ✅ Registrar cambios en historial

