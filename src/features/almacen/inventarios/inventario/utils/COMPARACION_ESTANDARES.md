# Comparación de Estándares de Inventario

## 1. Identificación del Producto (SKU vs. Clave Compuesta)

### Estándar (Odoo/ERPNext)
Los sistemas robustos utilizan un **SKU (Stock Keeping Unit)** o **Referencia Interna**.
- **Ejemplo:** `MAT-CABLE-001`
- **Validación:** El sistema impide crear otro producto con el mismo SKU.
- **Ventaja:** Elimina errores de tipeo. "Cable" y "cable" son visualmente iguales pero informáticamente distintos. El SKU normaliza esto.

### Sistema Valnet Actual
Utiliza una **Clave Compuesta**: `Nombre + Unidad + Marca + Modelo`.
- **Validación:** Buscamos coincidencias exactas de estos 4 campos.
- **Riesgo:** Sensible a mayúsculas, espacios y sinónimos.
  - *Caso:* "Cable UTP" vs "Cable de Red". El sistema permitirá ambos, creando duplicidad lógica.

### ✅ Recomendación
Usar el campo `codigoBarras` o crear `codigoInterno` como validador primario. Si dos artículos tienen el mismo código, el sistema debe forzar a usar el existente.

## 2. Arquitectura de Datos (Catálogo Global vs. Local)

### Estándar
Separación entre **Producto** y **Stock**.
1. **Producto:** Se define una vez (Nombre, Descripción, Foto, Marca).
2. **Stock Quant:** Es un registro que dice "Del Producto X, hay 10 en el Almacén A".

### Sistema Valnet Actual
El artículo contiene sus propios datos y su cantidad.
- Si tienes el "Mismo Material" en 5 inventarios, tienes 5 documentos de Artículos diferentes.
- **Riesgo:** Si decides cambiar el nombre de "Cable UTP" a "Cable Cat6", tienes que actualizarlo en los 5 inventarios uno por uno.

### ✅ Recomendación
A corto plazo, mantener la estructura actual por simplicidad, pero asegurar que al **Transferir**, se copien exactamente los datos del origen al destino para mantener consistencia. (Ya implementado en tu última actualización).

## 3. Trazabilidad de Series (Equipos)

### Estándar
El número de serie es la "Cédula" del equipo.
- Validaciones estrictas: Un serial no puede estar en dos lugares al mismo tiempo.
- Historial: Se puede ver toda la vida del serial (Compra -> Almacén -> Cliente -> Reparación).

### Sistema Valnet Actual
Validación global de seriales únicos.
- **Fortaleza:** Ya implementamos que no se pueda crear/transferir un serial si ya existe en otro lado.
- **Mejora Posible:** Agregar "Estados" al equipo (Disponible, Dañado, Reservado) para que un equipo dañado no se pueda transferir a un cliente.

## 4. Flujo de Transferencias

### Estándar (Doble Paso)
1. **Envío:** Almacén A envía -> Stock se mueve a "Ubicación Virtual de Tránsito".
2. **Recepción:** Almacén B valida lo físico -> Stock se mueve de "Tránsito" a "Almacén B".

### Sistema Valnet Actual
Transferencia Atómica (Inmediata).
- **Ventaja:** Rápido y sin burocracia. Ideal para movimientos internos rápidos.
- **Desventaja:** No refleja el tiempo real de transporte.

### ✅ Recomendación
Mantener el sistema inmediato si la logística es simple. Si hay camiones involucrados que tardan días, considerar agregar un estado de "En Tránsito".

## Resumen de Mejoras Aplicadas (En tu código actual)

Hemos logrado un nivel de seguridad muy cercano al estándar industrial con estas reglas ya implementadas:

1. **Bloqueo de Duplicados Exactos:** No permitimos crear el "mismo" material dos veces en el mismo inventario.
2. **Fusión Inteligente:** Al transferir, si el material existe, se fusiona (suma stock). Si no, se crea.
3. **Unicidad Global de Seriales:** Protección total contra clonación de equipos.
4. **Validación de Stocks Negativos:** Matemáticamente imposible tener menos de 0.

## Próximo Paso Sugerido
Estandarizar los nombres usando un campo de **Código**.

