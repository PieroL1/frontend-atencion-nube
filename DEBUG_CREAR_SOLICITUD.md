# 🐛 DEBUG: Error al Crear Solicitud desde Estudiante

## 🔍 Diagnóstico

### Problema Identificado
El estudiante NO puede crear solicitudes. Causas posibles:

1. ❌ **No existe `student_id` en el objeto `user`**
2. ❌ **El `student_id` no existe en la tabla `students`**
3. ❌ **Validación del backend rechaza la solicitud**

---

## 🧪 Paso 1: Verificar qué devuelve el Login

### En el Frontend (Consola del Navegador F12)

```javascript
// Ver qué usuario está logueado
const user = JSON.parse(localStorage.getItem('user'));
console.log('Usuario actual:', user);

// ¿Tiene student_id?
console.log('student_id:', user.student_id); // undefined = PROBLEMA
```

### Resultado Esperado (Backend Real)
```json
{
  "id": 5,
  "first_name": "Luis",
  "last_name": "Martinez",
  "email": "luis.martinez@uns.edu.pe",
  "role": ["student"],
  "student_id": 1  // ⭐ DEBE EXISTIR
}
```

### Si NO tiene `student_id`:

**Opción A: Arreglarlo en el Backend (RECOMENDADO)** 🔧

Editar `app/Http/Controllers/AuthController.php`:

```php
public function login(Request $request)
{
    // ... validación y autenticación ...
    
    $user = Auth::user();
    
    // ⭐ AGREGAR: Cargar relación student
    $user->load('student');
    
    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role,
            'student_id' => $user->student?->id, // ⭐ AGREGAR ESTO
        ]
    ]);
}
```

**Opción B: Obtenerlo del ID del User (Temporal)** ⚠️

Si el `student.id` es igual al `user.id`, podemos usar:

En `AtencionEstudiante.jsx`:
```javascript
const user = getUser();
const studentId = user?.student_id || user?.id || 1; // Usar user.id si no hay student_id
```

---

## 🧪 Paso 2: Verificar que Existe en la Tabla `students`

### En el Backend (Laravel Tinker o SQL)

```bash
cd C:\laragon\www\bienestar_user_07
php artisan tinker
```

```php
// Ver todos los estudiantes
\App\Models\Student::all();

// Ver si existe el student_id = 1
\App\Models\Student::find(1);

// Ver cuántos estudiantes hay
\App\Models\Student::count();
```

### Si NO existen estudiantes:

**Necesitas crear registros en la tabla `students`:**

```php
// En tinker o crear un seeder
DB::table('students')->insert([
    [
        'id' => 1,
        'user_id' => 5, // luis.martinez@uns.edu.pe
        'code' => '2021001',
        'academic_program' => 'Ingeniería de Sistemas',
        'full_name' => 'Luis Martinez',
        'email' => 'luis.martinez@uns.edu.pe',
        'created_at' => now(),
        'updated_at' => now(),
    ],
    [
        'id' => 2,
        'user_id' => 6, // carmen.lopez@uns.edu.pe
        'code' => '2021002',
        'academic_program' => 'Administración',
        'full_name' => 'Carmen Lopez',
        'email' => 'carmen.lopez@uns.edu.pe',
        'created_at' => now(),
        'updated_at' => now(),
    ],
    // ... más estudiantes
]);
```

---

## 🧪 Paso 3: Probar la Creación con Console

### En Consola del Navegador (F12)

```javascript
// 1. Importar funciones (solo funciona si el módulo está disponible)
import { solicitudes_create } from './src/services/atencion.js';

// 2. Intentar crear
try {
  const result = await solicitudes_create({
    student_id: 1,
    type_id: 1,
    description: 'Prueba de consola'
  });
  console.log('✅ Solicitud creada:', result);
} catch (error) {
  console.error('❌ Error:', error.response?.data);
}
```

### Errores Comunes

**Error 1: `student_id does not exist`**
```json
{
  "message": "The selected student id is invalid.",
  "errors": {
    "student_id": ["The selected student id is invalid."]
  }
}
```
**Solución:** Crear registro en tabla `students` (Paso 2)

**Error 2: `type_id does not exist`**
```json
{
  "message": "The selected type id is invalid.",
  "errors": {
    "type_id": ["The selected type id is invalid."]
  }
}
```
**Solución:** Verificar que existen tipos en la tabla `attention_students_request_types`

**Error 3: `Unauthenticated`**
```json
{
  "message": "Unauthenticated."
}
```
**Solución:** Hacer login primero

---

## ✅ Solución Rápida (Sin tocar Backend)

### Opción 1: Usar el ID del Usuario como student_id

**Archivo:** `src/pages/atencion/AtencionEstudiante.jsx`

```javascript
const user = getUser();
// Si user.id es el mismo que student.id en tu BD
const studentId = user?.student_id || user?.id || 1;
```

**⚠️ Solo funciona si:**
- El `user.id` es igual al `student.id` en la base de datos
- O si usas bypass (mocks)

### Opción 2: Hardcodear el student_id para pruebas

```javascript
// TEMPORAL PARA DESARROLLO
const studentId = 1; // Luis Martinez
```

Luego creas manualmente en la BD el registro:
```sql
INSERT INTO students (id, user_id, code, academic_program, full_name, email)
VALUES (1, 5, '2021001', 'Ing. Sistemas', 'Luis Martinez', 'luis.martinez@uns.edu.pe');
```

---

## ✅ Solución Definitiva (Tocar Backend - 5 minutos)

### 1. Agregar relación en el Modelo `User`

**Archivo:** `app/Models/User.php`

```php
public function student()
{
    return $this->hasOne(Student::class, 'user_id');
}
```

### 2. Devolver `student_id` en el Login

**Archivo:** `app/Http/Controllers/AuthController.php`

```php
public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = Auth::user();
    $user->load('student'); // ⭐ Cargar relación
    $token = $user->createToken('auth-token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'role' => $user->role,
            'student_id' => $user->student?->id, // ⭐ Agregar esto
        ]
    ]);
}

public function user(Request $request)
{
    $user = $request->user();
    $user->load('student'); // ⭐ También aquí
    
    return response()->json([
        'id' => $user->id,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'full_name' => $user->full_name,
        'email' => $user->email,
        'role' => $user->role,
        'student_id' => $user->student?->id, // ⭐ Y aquí
    ]);
}
```

### 3. Crear Registros en tabla `students`

**Crear Seeder:** `database/seeders/StudentsTableSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentsTableSeeder extends Seeder
{
    public function run()
    {
        $students = [
            ['user_id' => 5, 'code' => '2021001', 'academic_program' => 'Ingeniería de Sistemas', 'full_name' => 'Luis Martinez', 'email' => 'luis.martinez@uns.edu.pe'],
            ['user_id' => 6, 'code' => '2021002', 'academic_program' => 'Administración', 'full_name' => 'Carmen Lopez', 'email' => 'carmen.lopez@uns.edu.pe'],
            ['user_id' => 7, 'code' => '2021003', 'academic_program' => 'Derecho', 'full_name' => 'Pedro Sanchez', 'email' => 'pedro.sanchez@uns.edu.pe'],
            ['user_id' => 8, 'code' => '2021004', 'academic_program' => 'Medicina', 'full_name' => 'Maria Gonzalez', 'email' => 'maria.gonzalez@uns.edu.pe'],
            ['user_id' => 9, 'code' => '2021005', 'academic_program' => 'Contabilidad', 'full_name' => 'Carlos Rodriguez', 'email' => 'carlos.rodriguez@uns.edu.pe'],
        ];

        foreach ($students as $student) {
            DB::table('students')->insert(array_merge($student, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
```

**Ejecutar:**
```bash
php artisan db:seed --class=StudentsTableSeeder
```

---

## 📋 Checklist de Verificación

- [ ] El usuario logueado tiene `student_id` en `localStorage`
- [ ] Existe un registro en la tabla `students` con ese ID
- [ ] Existen tipos en la tabla `attention_students_request_types`
- [ ] El token de autenticación es válido
- [ ] La consola del navegador muestra los logs agregados
- [ ] El error específico se muestra en el `alert()`

---

## 🎯 Siguiente Paso

1. **Abre la consola del navegador (F12)**
2. **Login como estudiante:** `luis.martinez@uns.edu.pe` / `estudiante123`
3. **Intenta crear una solicitud**
4. **Copia el error que aparece en consola**
5. **Compártelo** para dar la solución exacta

El error dirá exactamente qué está fallando.
