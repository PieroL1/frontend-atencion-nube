# Análisis de Integración Backend-Frontend
**Fecha:** 17 de Octubre, 2025
**Módulo:** Atención al Estudiante

---

## 📋 Resumen Ejecutivo

El backend Laravel está funcional pero usa **rutas y estructuras diferentes** a las que espera el frontend React. Se requieren ajustes MÍNIMOS en el frontend para mapear correctamente.

---

## 🔍 Diferencias Identificadas

### 1. **Rutas de API**

| Funcionalidad | Frontend Espera | Backend Tiene | Estado |
|--------------|----------------|---------------|--------|
| **TIPOS** | | | |
| Listar tipos | `GET /atencion/tipos` | `GET /tipos-solicitud/getAll` | ❌ Diferente |
| Crear tipo | `POST /atencion/tipos` | `POST /tipos-solicitud/create` | ❌ Diferente |
| Actualizar tipo | `PUT /atencion/tipos/{id}` | `PUT /tipos-solicitud/{id}` | ⚠️ Similar |
| Eliminar tipo | `DELETE /atencion/tipos/{id}` | `DELETE /tipos-solicitud/{id}` | ⚠️ Similar |
| **SOLICITUDES** | | | |
| Listar solicitudes | `GET /atencion/solicitudes` | `GET /solicitudes-atencion/getAll` | ❌ Diferente |
| Ver solicitud | `GET /atencion/solicitudes/{id}` | `GET /solicitudes-atencion/get/{id}` | ❌ Diferente |
| Crear solicitud | `POST /atencion/solicitudes` | `POST /solicitudes-atencion/create` | ❌ Diferente |
| Actualizar solicitud | `PATCH /atencion/solicitudes/{id}` | `PUT /solicitudes-atencion/{id}` | ❌ Diferente |
| Cambiar estado | `PATCH /atencion/solicitudes/{id}/estado` | ❌ **NO EXISTE** | ❌ Faltante |
| **HISTORIAL** | | | |
| Listar historial | `GET /atencion/solicitudes/{id}/historial` | `GET /historial-solicitudes/getAll?request_id={id}` | ❌ Diferente |
| Agregar comentario | `POST /atencion/solicitudes/{id}/historial` | `POST /historial-solicitudes/create` | ⚠️ Similar |

---

### 2. **Estructura de Respuestas**

#### Backend devuelve:
```json
{
  "success": true,
  "data": [...],
  "message": "..."
}
```

#### Frontend espera (en modo no-bypass):
```json
{
  "data": [...],
  "meta": { ... }
}
```

---

### 3. **Nombres de Campos**

#### ✅ TIPOS - Compatible
| Frontend | Backend | Estado |
|----------|---------|--------|
| `id_type` | `id` | ⚠️ Diferente |
| `name_type` | `name_type` | ✅ OK |
| `description` | `description` | ✅ OK |

#### ⚠️ SOLICITUDES - Parcialmente Compatible
| Frontend | Backend | Estado |
|----------|---------|--------|
| `id` | `id` | ✅ OK |
| `student_id` | `student_id` | ✅ OK |
| `type_id` | `type_id` | ✅ OK |
| `description` | `description` | ✅ OK |
| `creation_date` | `creation_date` | ✅ OK |
| `update_date` | `update_date` | ✅ OK |
| `current_state` | `current_state` | ✅ OK |
| `final_answer` | `final_answer` | ✅ OK |
| `type_name` | *Calculado* | ⚠️ Debe calcularse en frontend |
| `state_ui` | *Debe mapearse* | ⚠️ Debe mapearse en frontend |

#### ✅ HISTORIAL - Compatible
| Frontend | Backend | Estado |
|----------|---------|--------|
| `id_history` | `id` | ⚠️ Diferente |
| `id_attention_students_request` | `id_attention_students_request` | ✅ OK |
| `previous_state` | `previous_state` | ✅ OK |
| `new_state` | `new_state` | ✅ OK |
| `comment` | `comment` | ✅ OK |
| `change_date` | `change_date` | ✅ OK |
| `id_employee_responsible` | `id_employee_responsible` | ✅ OK |

---

### 4. **Estados (current_state)**

#### Backend acepta/devuelve:
- `in_progress`
- `completed`
- `failed`

#### Frontend UI usa (español):
- `Recibido` → ❌ **NO EXISTE EN BACKEND**
- `En proceso` → `in_progress`
- `Resuelto` → `completed`

⚠️ **PROBLEMA:** El backend NO tiene estado `received` (Recibido). Solo `in_progress`, `completed`, `failed`.

---

## 🛠️ Endpoints Faltantes en Backend

### ❌ **CRÍTICO:** Cambiar Estado de Solicitud
```
PATCH /api/atencion/solicitudes/{id}/estado
Body: { new_state, note }
```

**Funcionalidad esperada:**
1. Actualizar `current_state` de la solicitud
2. Crear entrada en historial automáticamente
3. Devolver solicitud actualizada

**Solución temporal en frontend:** Hacer 2 llamadas separadas:
1. `PUT /solicitudes-atencion/{id}` para actualizar state
2. `POST /historial-solicitudes/create` para agregar historial

---

### ⚠️ **IMPORTANTE:** Filtros en Solicitudes

El backend `getAll()` NO acepta parámetros de filtro actualmente:
- NO filtra por `state`
- NO filtra por `type_id`
- NO filtra por búsqueda de texto `q`

**Solución:** Filtrar en frontend después de obtener todos los datos.

---

## ✅ Soluciones Propuestas

### Opción A: **Ajustar Frontend (MÍNIMO)** ⭐ RECOMENDADO
- Mapear rutas en `atencion.js`
- Adaptar estructura de respuestas
- Normalizar nombres de campos
- Agregar estado `received` al mapeo
- Implementar función `cambiarEstado` con 2 llamadas

**Ventajas:**
- ✅ No tocar backend
- ✅ Cambios concentrados en 1 archivo
- ✅ Compatible con mocks existentes

**Desventajas:**
- ⚠️ Sin filtros del lado del servidor (performance en producción)
- ⚠️ 2 llamadas para cambiar estado

---

### Opción B: **Mejorar Backend (IDEAL)**
Agregar en backend:

1. **Nuevo endpoint:**
```php
// AttentionStudentsRequestController.php
public function updateState(Request $request, $id) {
    // Validar new_state, note
    // Actualizar solicitud
    // Crear historial automáticamente
    // Devolver solicitud actualizada
}
```

2. **Agregar estado `received`:**
```php
Rule::in(['received', 'in_progress', 'completed', 'failed'])
```

3. **Agregar filtros en getAll():**
```php
public function getAll(Request $request) {
    $query = AttentionStudentsRequest::with(['student', 'type']);
    
    if ($request->has('state')) {
        $query->where('current_state', $request->state);
    }
    if ($request->has('type_id')) {
        $query->where('type_id', $request->type_id);
    }
    if ($request->has('q')) {
        $query->where('description', 'like', '%' . $request->q . '%');
    }
    
    return $query->orderByDesc('creation_date')->get();
}
```

**Ventajas:**
- ✅ API REST más completa
- ✅ Filtros del lado del servidor
- ✅ 1 sola llamada para cambiar estado
- ✅ Frontend más simple

**Desventajas:**
- ⚠️ Requiere cambios en backend
- ⚠️ Requiere pruebas en backend

---

## 🎯 Decisión: Opción A (Ajustar Frontend Mínimamente)

**Razón:** El usuario pidió NO modificar backend si es posible.

---

## 📝 Cambios Necesarios en Frontend

### Archivo: `src/services/atencion.js`

#### Cambios en rutas:
```javascript
// Antes: GET /atencion/tipos
// Ahora:  GET /tipos-solicitud/getAll

// Antes: POST /atencion/solicitudes
// Ahora:  POST /solicitudes-atencion/create

// etc...
```

#### Cambios en mapeo de estados:
```javascript
// Agregar mapeo para "Recibido"
const DB_TO_UI = {
  received: 'Recibido',      // ❌ NO existe en backend
  in_progress: 'En proceso',  // ✅ OK
  completed: 'Resuelto',      // ✅ OK
  failed: 'Fallido',          // ⚠️ Nuevo (no usado en UI)
};
```

**NOTA:** Como el backend NO tiene `received`, usaremos `in_progress` como estado inicial.

#### Cambios en adaptación de respuestas:
```javascript
// Backend devuelve: { success, data, message }
// Necesitamos:      { data, meta }

const { data: response } = await api.get('/tipos-solicitud/getAll');
return response.data; // Extraer el array de data
```

---

## 🧪 Plan de Pruebas

1. ✅ **Listar tipos** - Verificar mapeo de `id` a `id_type`
2. ✅ **Crear tipo** - Verificar respuesta envuelta
3. ✅ **Editar tipo** - Verificar PUT funciona
4. ✅ **Eliminar tipo** - Verificar 204 response
5. ✅ **Listar solicitudes** - Verificar decoración con `type_name` y `state_ui`
6. ✅ **Ver detalle solicitud** - Verificar campos completos
7. ✅ **Cambiar estado** - Verificar 2 llamadas (update + historial)
8. ✅ **Listar historial** - Verificar query param `request_id`
9. ✅ **Agregar comentario** - Verificar body correcto

---

## ⚠️ Limitaciones Conocidas

1. **Sin filtros del servidor:** Todos los filtros se aplican en frontend (puede ser lento con muchos datos)
2. **Sin estado "Recibido":** Se usará `in_progress` como inicial
3. **2 llamadas para cambiar estado:** No es atómico, podría fallar una y la otra no
4. **ID inconsistente:** Backend usa `id`, frontend espera `id_type` en tipos e `id_history` en historial

---

## 📌 Conclusión

El backend está **funcional pero incompleto** para el frontend actual. Los ajustes propuestos en el frontend son **mínimos y viables**, pero se recomienda eventualmente mejorar el backend para una solución más robusta.
