# 🧪 Plan de Pruebas - Backend Real
**Módulo:** Atención al Estudiante  
**Fecha:** 17 de Octubre, 2025

---

## ✅ Cambios Realizados en Frontend

### Archivo: `src/services/atencion.js`

Se han realizado los siguientes ajustes **mínimos** para compatibilidad con el backend Laravel:

#### 1. **Mapeo de Estados**
```javascript
// Backend NO tiene estado "received", usamos in_progress como inicial
const DB_TO_UI = {
  received: 'Recibido',       // Solo en mocks
  in_progress: 'En proceso',  // Backend usa este como inicial
  completed: 'Resuelto',
  failed: 'Fallido',
};

const UI_TO_DB = {
  'Recibido': 'in_progress',  // Mapeamos a in_progress
  'En proceso': 'in_progress',
  'Resuelto': 'completed',
};
```

#### 2. **Rutas Actualizadas**

| Función | Ruta Anterior | Ruta Nueva (Backend Real) |
|---------|---------------|---------------------------|
| `tipos_list` | `/atencion/tipos` | `/tipos-solicitud/getAll` |
| `tipos_create` | `/atencion/tipos` | `/tipos-solicitud/create` |
| `tipos_update` | `/atencion/tipos/{id}` | `/tipos-solicitud/{id}` |
| `tipos_delete` | `/atencion/tipos/{id}` | `/tipos-solicitud/{id}` |
| `solicitudes_list` | `/atencion/solicitudes` | `/solicitudes-atencion/getAll` |
| `solicitudes_get` | `/atencion/solicitudes/{id}` | `/solicitudes-atencion/get/{id}` |
| `solicitudes_create` | `/atencion/solicitudes` | `/solicitudes-atencion/create` |
| `solicitudes_update` | `/atencion/solicitudes/{id}` | `/solicitudes-atencion/{id}` |
| `solicitudes_cambiarEstado` | `/atencion/solicitudes/{id}/estado` | **2 llamadas: PUT + POST** |
| `historial_list` | `/atencion/solicitudes/{id}/historial` | `/historial-solicitudes/getAll?request_id={id}` |
| `historial_addComentario` | `/atencion/solicitudes/{id}/historial` | `/historial-solicitudes/create` |

#### 3. **Adaptación de Respuestas**

El backend devuelve:
```json
{
  "success": true,
  "data": [...],
  "message": "..."
}
```

El frontend ahora extrae `response.data` correctamente.

#### 4. **Mapeo de IDs**

- **Tipos:** Backend usa `id`, frontend usa `id_type` → Se mapea automáticamente
- **Historial:** Backend usa `id`, frontend usa `id_history` → Se mapea automáticamente

#### 5. **Cambio de Estado (Solución Temporal)**

Como el backend **NO tiene endpoint `/estado`**, la función `solicitudes_cambiarEstado` hace 3 llamadas:

1. `GET /solicitudes-atencion/get/{id}` - Obtener estado actual
2. `PUT /solicitudes-atencion/{id}` - Actualizar current_state
3. `POST /historial-solicitudes/create` - Registrar cambio en historial

---

## 🧪 Pruebas a Realizar

### Pre-requisitos

1. ✅ Backend Laravel corriendo en `http://127.0.0.1:8000`
2. ✅ Base de datos migrada con tablas:
   - `attention_students_request_types`
   - `attention_students_requests`
   - `attention_students_request_histories`
   - `students`
   - `employees`
3. ✅ Usuario autenticado (token en localStorage)
4. ✅ Cambiar `.env` a **modo backend real**:
   ```
   VITE_AUTH_BYPASS=false
   VITE_API_URL=http://127.0.0.1:8000/api
   ```

---

### Prueba 1: CRUD de Tipos ✅

#### 1.1 Listar Tipos
```javascript
// Abrir consola del navegador
import { tipos_list } from './services/atencion.js';
const tipos = await tipos_list();
console.log('Tipos:', tipos);

// ✅ Verificar que devuelve array con: id_type, name_type, description
```

#### 1.2 Crear Tipo
```javascript
import { tipos_create } from './services/atencion.js';
const nuevoTipo = await tipos_create({
  name_type: 'Prueba Backend',
  description: 'Tipo de prueba desde frontend'
});
console.log('Tipo creado:', nuevoTipo);

// ✅ Verificar que devuelve el tipo con id_type asignado
```

#### 1.3 Editar Tipo
```javascript
import { tipos_update } from './services/atencion.js';
const tipoEditado = await tipos_update(nuevoTipo.id_type, {
  name_type: 'Prueba Backend EDITADO',
  description: 'Descripción actualizada'
});
console.log('Tipo editado:', tipoEditado);

// ✅ Verificar que los cambios se reflejan
```

#### 1.4 Eliminar Tipo
```javascript
import { tipos_delete } from './services/atencion.js';
const resultado = await tipos_delete(nuevoTipo.id_type);
console.log('Tipo eliminado:', resultado);

// ✅ Verificar que devuelve { ok: true }
// ✅ Verificar que el tipo ya no aparece en la lista
```

---

### Prueba 2: Solicitudes ✅

#### 2.1 Listar Solicitudes
```javascript
import { solicitudes_list } from './services/atencion.js';

// Sin filtros
const todas = await solicitudes_list();
console.log('Todas las solicitudes:', todas);

// Con filtro por tipo
const porTipo = await solicitudes_list({ type_id: 1 });
console.log('Filtradas por tipo:', porTipo);

// Con filtro por estado
const porEstado = await solicitudes_list({ state_ui: 'En proceso' });
console.log('En proceso:', porEstado);

// Con búsqueda de texto
const busqueda = await solicitudes_list({ q: 'constancia' });
console.log('Búsqueda "constancia":', busqueda);

// ✅ Verificar que cada ítem tiene: state_ui y type_name decorados
// ✅ Verificar que los filtros funcionan correctamente
```

#### 2.2 Ver Detalle de Solicitud
```javascript
import { solicitudes_get } from './services/atencion.js';
const detalle = await solicitudes_get(1); // Usar ID real
console.log('Detalle:', detalle);

// ✅ Verificar que tiene todos los campos + state_ui + type_name
```

#### 2.3 Crear Solicitud
```javascript
import { solicitudes_create } from './services/atencion.js';
const nueva = await solicitudes_create({
  student_id: 1, // Usar ID de estudiante real
  type_id: 1,    // Usar ID de tipo real
  description: 'Solicitud de prueba desde frontend'
});
console.log('Solicitud creada:', nueva);

// ✅ Verificar que current_state es 'in_progress' (backend no tiene 'received')
// ✅ Verificar que state_ui es 'En proceso'
```

---

### Prueba 3: Cambio de Estado ⚠️ CRÍTICA

```javascript
import { solicitudes_cambiarEstado } from './services/atencion.js';

// Cambiar a "Resuelto"
const actualizada = await solicitudes_cambiarEstado(
  nueva.id, 
  'Resuelto', 
  'Solicitud finalizada desde prueba'
);
console.log('Estado cambiado:', actualizada);

// ✅ Verificar que current_state cambió a 'completed'
// ✅ Verificar que state_ui es 'Resuelto'
// ✅ Verificar que se creó entrada en historial (ver Prueba 4)
```

**NOTA:** Esta función hace 3 llamadas al backend. Si alguna falla, puede quedar inconsistente.

---

### Prueba 4: Historial ✅

#### 4.1 Listar Historial
```javascript
import { historial_list } from './services/atencion.js';
const historial = await historial_list(nueva.id);
console.log('Historial:', historial);

// ✅ Verificar que aparece el cambio de estado de la Prueba 3
// ✅ Verificar que cada entrada tiene: id_history, previous_state, new_state, comment
```

#### 4.2 Agregar Comentario
```javascript
import { historial_addComentario } from './services/atencion.js';
const comentario = await historial_addComentario(
  nueva.id,
  'Este es un comentario de seguimiento'
);
console.log('Comentario agregado:', comentario);

// ✅ Verificar que previous_state y new_state son null
// ✅ Verificar que comment tiene el texto correcto
// ✅ Volver a listar historial y verificar que aparece el nuevo comentario
```

---

### Prueba 5: Filtros en Vista de Empleado 🎯

1. Abrir `http://localhost:5173/atencion/empleado`
2. Hacer clic en pestaña **"En proceso"**
   - ✅ Solo deben aparecer solicitudes en ese estado
3. Seleccionar un **Tipo específico** en el dropdown
   - ✅ Solo deben aparecer solicitudes de ese tipo
4. Escribir texto en el buscador y presionar **Enter**
   - ✅ Solo deben aparecer solicitudes que contengan ese texto en description
5. Combinar filtros (Estado + Tipo)
   - ✅ Ambos filtros deben aplicarse simultáneamente

---

### Prueba 6: Cambio de Estado desde UI 🎯

1. Hacer clic en **"Ver"** de una solicitud
2. En el modal, cambiar el estado usando el dropdown
3. Verificar:
   - ✅ El badge de estado se actualiza inmediatamente
   - ✅ Aparece nueva entrada en el historial con el cambio
   - ✅ Al cerrar y volver a abrir, el estado persiste
   - ✅ En la tabla principal, el estado también se actualizó

---

### Prueba 7: Agregar Comentario desde UI 🎯

1. Abrir detalle de una solicitud
2. Escribir comentario en el input
3. Hacer clic en **"Comentar"**
4. Verificar:
   - ✅ El comentario aparece en el historial inmediatamente
   - ✅ El input se limpia
   - ✅ Al cerrar y volver a abrir, el comentario persiste

---

## ⚠️ Limitaciones Conocidas

### 1. **Sin Filtros del Servidor**

El backend `getAll()` NO acepta parámetros de filtro. Todos los filtros se aplican en el frontend.

**Impacto:**
- ✅ OK para desarrollo
- ⚠️ Puede ser lento con muchos datos en producción

**Recomendación para el backend:**
```php
// AttentionStudentsRequestController.php
public function getAll(Request $request) {
    $query = AttentionStudentsRequest::with(['student', 'type']);
    
    // Filtro por estado
    if ($request->has('state') || $request->has('current_state')) {
        $state = $request->state ?? $request->current_state;
        $query->where('current_state', $state);
    }
    
    // Filtro por tipo
    if ($request->has('type_id')) {
        $query->where('type_id', $request->type_id);
    }
    
    // Búsqueda en descripción
    if ($request->has('q')) {
        $query->where('description', 'like', '%' . $request->q . '%');
    }
    
    $items = $query->orderByDesc('creation_date')->get();
    return response()->json([
        'success' => true,
        'data' => AttentionStudentsRequestResource::collection($items),
        'message' => 'Lista de solicitudes',
    ]);
}
```

---

### 2. **Sin Estado "Recibido"**

El backend solo tiene: `in_progress`, `completed`, `failed`.

**Solución actual:**
- Frontend mapea "Recibido" → `in_progress`
- Las solicitudes nuevas se crean con estado "En proceso"

**Recomendación para el backend:**
```php
// AttentionStudentsRequestController.php
// En validación, agregar 'received'
Rule::in(['received', 'in_progress', 'completed', 'failed'])
```

---

### 3. **Cambio de Estado NO Atómico**

La función `solicitudes_cambiarEstado` hace 3 llamadas:
1. GET para obtener estado actual
2. PUT para actualizar
3. POST para registrar historial

**Problema:** Si la llamada 3 falla, la solicitud se actualiza pero no hay historial.

**Recomendación para el backend:**
```php
// AttentionStudentsRequestController.php
public function updateState(Request $request, $id) {
    $data = $request->validate([
        'new_state' => ['required', Rule::in(['received', 'in_progress', 'completed', 'failed'])],
        'note' => ['nullable', 'string', 'max:200'],
    ]);
    
    DB::beginTransaction();
    try {
        $solicitud = AttentionStudentsRequest::findOrFail($id);
        $previousState = $solicitud->current_state;
        
        // Actualizar estado
        $solicitud->update(['current_state' => $data['new_state']]);
        
        // Crear historial automáticamente
        AttentionStudentsRequestHistory::create([
            'id_attention_students_request' => $id,
            'previous_state' => $previousState,
            'new_state' => $data['new_state'],
            'comment' => $data['note'] ?? null,
            'change_date' => now(),
            'id_employee_responsible' => auth()->id(),
        ]);
        
        DB::commit();
        
        return response()->json([
            'success' => true,
            'data' => new AttentionStudentsRequestResource($solicitud->load('type')),
            'message' => 'Estado actualizado',
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        throw $e;
    }
}
```

Y en `routes/api.php`:
```php
Route::patch('/solicitudes-atencion/{id}/estado', [AttentionStudentsRequestController::class, 'updateState']);
```

---

## 📊 Checklist de Integración

- [x] Rutas del frontend actualizadas a las del backend
- [x] Mapeo de respuestas `{ success, data, message }` → extraer `data`
- [x] Mapeo de IDs: `id` → `id_type`, `id` → `id_history`
- [x] Mapeo de estados: `received` → `in_progress`
- [x] Decoración de solicitudes con `state_ui` y `type_name`
- [x] Filtros aplicados en frontend (backend no los soporta)
- [x] Cambio de estado con 3 llamadas separadas
- [x] Historial con query param `request_id`
- [x] Agregar comentario con body completo

---

## 🎯 Siguiente Paso

1. **Asegurarse que el backend está corriendo:**
   ```bash
   cd C:\laragon\www\bienestar_user_07
   php artisan serve
   ```

2. **Configurar frontend para modo real:**
   ```bash
   # Editar .env.development.local
   VITE_AUTH_BYPASS=false
   VITE_API_URL=http://127.0.0.1:8000/api
   ```

3. **Iniciar frontend:**
   ```bash
   cd C:\laragon\www\frontend-atencion-nube
   npm run dev
   ```

4. **Login y probar:**
   - Ir a `/login`
   - Usar credenciales de prueba
   - Navegar a `/atencion/empleado`
   - Ejecutar pruebas de este documento

---

## 📝 Notas Finales

- ✅ El frontend está listo para trabajar con el backend real
- ✅ Los cambios son mínimos y no afectan el funcionamiento con mocks
- ⚠️ Se recomienda agregar los endpoints faltantes en el backend para una solución más robusta
- ⚠️ Los filtros en frontend funcionan pero pueden ser lentos con muchos datos

**¿Algún problema?** Revisar:
1. Token en localStorage
2. CORS configurado en backend
3. Middleware `auth:sanctum` aplicado
4. Base de datos con datos de prueba
