# 📘 CLASE 3: Middlewares y Validaciones con Joi

**Profesor:** Bienvenido/a a la Clase 3. Ya dominas Express y arquitectura en capas. Ahora aprenderás a usar **middlewares personalizados** y **validaciones profesionales con Joi**. Esto es ESENCIAL para tu examen.

**Duración:** 2 horas  
**Objetivo:** Crear middlewares personalizados y validar datos con Joi

---

## 🎯 PARTE 1: TEORÍA DE MIDDLEWARES (30 minutos)

### 1.1 ¿Qué es un Middleware?

**Definición:**  
Un middleware es una función que se ejecuta **entre** la petición (request) y la respuesta (response).

**Analogía:** Como los controles de seguridad en un aeropuerto:
```
Cliente → [Control 1] → [Control 2] → [Control 3] → Destino
         (pasaporte)   (equipaje)    (scanner)
```

En Express:
```
Request → [Middleware 1] → [Middleware 2] → [Controller] → Response
         (logging)        (validación)      (lógica)
```

---

### 1.2 Anatomía de un Middleware
```javascript
function miMiddleware(req, res, next) {
    // 1. Hacer algo ANTES de pasar al siguiente
    console.log('Petición recibida');
    
    // 2. Modificar req o res si es necesario
    req.timestamp = new Date();
    
    // 3. Llamar a next() para continuar
    next();
    
    // 4. Hacer algo DESPUÉS (opcional)
    console.log('Respuesta enviada');
}
```

**Componentes:**
- `req` - Request (petición del cliente)
- `res` - Response (respuesta al cliente)
- `next` - Función para pasar al siguiente middleware

---

### 1.3 Tipos de Middlewares

#### **A) Middleware de Aplicación (Global)**

Se ejecuta para **todas** las rutas.
```javascript
// Se ejecuta en TODAS las peticiones
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
```

#### **B) Middleware de Ruta (Específico)**

Se ejecuta solo en rutas específicas.
```javascript
// Solo se ejecuta en /usuarios
app.use('/usuarios', middlewareDeUsuarios);

// Solo se ejecuta en esta ruta específica
app.get('/admin', verificarAdmin, (req, res) => {
    res.json({ mensaje: 'Panel de admin' });
});
```

#### **C) Middleware de Error**

Se ejecuta cuando hay un error.
```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});
```

**IMPORTANTE:** Los middlewares de error tienen **4 parámetros** (err, req, res, next).

---

### 1.4 Flujo de Middlewares
```javascript
app.use(middleware1);     // 1. Se ejecuta primero
app.use(middleware2);     // 2. Se ejecuta segundo
app.get('/ruta', middleware3, controller);  // 3. y 4.
app.use(errorHandler);    // 5. Si hay error
```

**Flujo:**
```
Request
  ↓
middleware1 → next()
  ↓
middleware2 → next()
  ↓
middleware3 → next()
  ↓
controller → res.json()
  ↓
Response
```

**Si hay error:**
```
Request
  ↓
middleware1 → next()
  ↓
middleware2 → next(error)  ← Llamar con error
  ↓
[Salta todos los middlewares normales]
  ↓
errorHandler
  ↓
Response (con error)
```

---

### 1.5 Cuándo usar Middlewares

**Usa middlewares para:**
- ✅ Logging (registrar peticiones)
- ✅ Autenticación/Autorización
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Parsear datos (JSON, cookies, etc.)
- ✅ CORS
- ✅ Comprimir respuestas

**NO uses middlewares para:**
- ❌ Lógica de negocio (eso va en services)
- ❌ Acceso a base de datos (eso va en repositories)

---

## 💻 PARTE 2: MIDDLEWARES PERSONALIZADOS (30 minutos)

### Ejercicio Guiado 1: Middleware de Logging

Vamos a crear un middleware que registre todas las peticiones.
```javascript
// src/middlewares/logger.js

function logger(req, res, next) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    
    console.log(`[${timestamp}] ${method} ${url}`);
    
    // Continuar al siguiente middleware
    next();
}

module.exports = logger;
```

**Usar en server.js:**
```javascript
const express = require('express');
const logger = require('./src/middlewares/logger');

const app = express();

// Middleware global - se ejecuta en TODAS las rutas
app.use(logger);

// ... resto del código
```

**Resultado:**
```
[2025-11-20T10:30:45.123Z] GET /libros
[2025-11-20T10:30:50.456Z] POST /libros
[2025-11-20T10:31:02.789Z] GET /libros/1
```

---

### Ejercicio Guiado 2: Middleware de Timing

Medir cuánto tarda cada petición.
```javascript
// src/middlewares/timer.js

function timer(req, res, next) {
    // Guardar el tiempo de inicio
    const start = Date.now();
    
    // Cuando se envíe la respuesta, calcular duración
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} - ${duration}ms`);
    });
    
    next();
}

module.exports = timer;
```

**Usar en server.js:**
```javascript
app.use(timer);
```

**Resultado:**
```
GET /libros - 45ms
POST /libros - 120ms
GET /libros/1 - 23ms
```

---

### Ejercicio Guiado 3: Middleware de Autenticación (Simulado)
```javascript
// src/middlewares/auth.js

function requireAuth(req, res, next) {
    // Verificar si hay token en headers
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ 
            error: 'No autorizado. Token requerido.' 
        });
    }
    
    // Verificar token (simulado)
    if (token !== 'Bearer mi-token-secreto') {
        return res.status(403).json({ 
            error: 'Token inválido' 
        });
    }
    
    // Si todo OK, agregar datos del usuario a req
    req.user = {
        id: 1,
        nombre: 'Usuario Admin',
        rol: 'admin'
    };
    
    next();
}

module.exports = requireAuth;
```

**Usar en rutas específicas:**
```javascript
// src/routes/libroRoutes.js
const requireAuth = require('../middlewares/auth');

// Ruta pública (sin auth)
router.get('/', controller.getLibros);

// Rutas protegidas (con auth)
router.post('/', requireAuth, controller.createLibro);
router.delete('/:id', requireAuth, controller.deleteLibro);
```

**Probar:**
```http
### Sin token (ERROR 401)
POST http://localhost:3000/libros
Content-Type: application/json

{
  "titulo": "Nuevo libro"
}

### Con token (ÉXITO)
POST http://localhost:3000/libros
Content-Type: application/json
Authorization: Bearer mi-token-secreto

{
  "titulo": "Nuevo libro"
}
```

---

### Ejercicio Guiado 4: Middleware de Manejo de Errores
```javascript
// src/middlewares/errorHandler.js

function errorHandler(err, req, res, next) {
    // Log del error
    console.error('❌ ERROR:', err.message);
    console.error(err.stack);
    
    // Determinar código de estado
    let statusCode = 500;
    let message = 'Error interno del servidor';
    
    if (err.message.includes('no encontrado')) {
        statusCode = 404;
        message = err.message;
    } else if (err.message.includes('obligatorio')) {
        statusCode = 400;
        message = err.message;
    } else if (err.message.includes('autorizado')) {
        statusCode = 401;
        message = err.message;
    }
    
    // Enviar respuesta
    res.status(statusCode).json({
        error: message,
        timestamp: new Date().toISOString()
    });
}

module.exports = errorHandler;
```

**Usar en server.js (AL FINAL):**
```javascript
const errorHandler = require('./src/middlewares/errorHandler');

// Rutas
app.use('/libros', libroRoutes);

// Middleware de errores SIEMPRE AL FINAL
app.use(errorHandler);
```

---

## 🎯 PARTE 3: VALIDACIONES CON JOI (40 minutos)

### 3.1 ¿Qué es Joi?

**Joi** es una librería para validar datos de forma profesional.

**¿Por qué Joi en lugar de validaciones manuales?**

**❌ Validación manual:**
```javascript
if (!libro.titulo) {
    throw new Error('Título obligatorio');
}
if (!libro.autor) {
    throw new Error('Autor obligatorio');
}
if (libro.año < 1000 || libro.año > 2025) {
    throw new Error('Año inválido');
}
// ... 20 líneas más de validaciones
```

**✅ Validación con Joi:**
```javascript
const schema = Joi.object({
    titulo: Joi.string().required(),
    autor: Joi.string().required(),
    año: Joi.number().min(1000).max(2025).required()
});
```

**Ventajas de Joi:**
- ✅ Código más limpio y legible
- ✅ Mensajes de error automáticos
- ✅ Validaciones complejas fáciles
- ✅ Reutilizable
- ✅ Estándar de la industria

---

### 3.2 Instalación
```bash
npm install joi
```

---

### 3.3 Sintaxis Básica de Joi

#### **Tipos de datos:**
```javascript
const Joi = require('joi');

// String
Joi.string()
Joi.string().min(3)           // Mínimo 3 caracteres
Joi.string().max(100)         // Máximo 100 caracteres
Joi.string().email()          // Formato email
Joi.string().alphanum()       // Solo letras y números
Joi.string().required()       // Obligatorio

// Number
Joi.number()
Joi.number().min(0)           // Mínimo 0
Joi.number().max(100)         // Máximo 100
Joi.number().integer()        // Solo enteros
Joi.number().positive()       // Solo positivos
Joi.number().required()       // Obligatorio

// Boolean
Joi.boolean()
Joi.boolean().required()

// Date
Joi.date()
Joi.date().min('2000-01-01')
Joi.date().max('now')

// Array
Joi.array()
Joi.array().items(Joi.string())     // Array de strings
Joi.array().min(1)                  // Mínimo 1 elemento
Joi.array().required()

// Object
Joi.object({
    nombre: Joi.string().required(),
    edad: Joi.number().required()
})

// Enum (valores específicos)
Joi.string().valid('Ficción', 'Drama', 'Terror')
```

---

### 3.4 Crear Schemas de Validación

Vamos a crear schemas para nuestro sistema de libros.
```javascript
// src/validations/libroSchemas.js
const Joi = require('joi');

// Géneros válidos
const generosValidos = ['Ficción', 'No Ficción', 'Ciencia', 'Historia', 'Biografía'];

// Schema para CREAR libro
const createLibroSchema = Joi.object({
    titulo: Joi.string()
        .min(1)
        .max(200)
        .required()
        .messages({
            'string.empty': 'El título no puede estar vacío',
            'string.min': 'El título debe tener al menos 1 carácter',
            'string.max': 'El título no puede tener más de 200 caracteres',
            'any.required': 'El título es obligatorio'
        }),
    
    autor: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': 'El autor no puede estar vacío',
            'any.required': 'El autor es obligatorio'
        }),
    
    año: Joi.number()
        .integer()
        .min(1000)
        .max(2025)
        .required()
        .messages({
            'number.base': 'El año debe ser un número',
            'number.min': 'El año debe ser mayor a 1000',
            'number.max': 'El año debe ser menor a 2025',
            'any.required': 'El año es obligatorio'
        }),
    
    genero: Joi.string()
        .valid(...generosValidos)
        .required()
        .messages({
            'any.only': `El género debe ser uno de: ${generosValidos.join(', ')}`,
            'any.required': 'El género es obligatorio'
        }),
    
    // Campos opcionales que no deben venir en el body
    disponible: Joi.forbidden(),
    prestamos: Joi.forbidden(),
    id: Joi.forbidden()
});

// Schema para ACTUALIZAR libro (todos opcionales)
const updateLibroSchema = Joi.object({
    titulo: Joi.string().min(1).max(200),
    autor: Joi.string().min(1).max(100),
    año: Joi.number().integer().min(1000).max(2025),
    genero: Joi.string().valid(...generosValidos),
    disponible: Joi.boolean(),
    prestamos: Joi.number().integer().min(0)
}).min(1);  // Al menos 1 campo debe venir

// Schema para filtros de búsqueda
const filterLibrosSchema = Joi.object({
    genero: Joi.string().valid(...generosValidos),
    autor: Joi.string(),
    disponible: Joi.string().valid('true', 'false')
});

module.exports = {
    createLibroSchema,
    updateLibroSchema,
    filterLibrosSchema
};
```

---

### 3.5 Middleware de Validación con Joi

Crear un middleware reutilizable para validar con Joi.
```javascript
// src/middlewares/validate.js

function validate(schema) {
    return (req, res, next) => {
        // Validar el body contra el schema
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,  // Mostrar todos los errores, no solo el primero
            stripUnknown: true  // Eliminar campos no definidos en el schema
        });
        
        if (error) {
            // Extraer mensajes de error
            const errors = error.details.map(detail => detail.message);
            
            return res.status(400).json({
                error: 'Error de validación',
                detalles: errors
            });
        }
        
        // Reemplazar req.body con el valor validado
        req.body = value;
        
        next();
    };
}

module.exports = validate;
```

---

### 3.6 Usar Validaciones en Rutas
```javascript
// src/routes/libroRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/libroController');
const validate = require('../middlewares/validate');
const { 
    createLibroSchema, 
    updateLibroSchema 
} = require('../validations/libroSchemas');

// GET sin validación (solo lectura)
router.get('/', controller.getLibros);
router.get('/:id', controller.getLibroById);

// POST con validación
router.post('/', 
    validate(createLibroSchema),  // ← Middleware de validación
    controller.createLibro
);

// PATCH con validación
router.patch('/:id', 
    validate(updateLibroSchema),  // ← Middleware de validación
    controller.updateLibro
);

// DELETE sin validación
router.delete('/:id', controller.deleteLibro);

// Rutas especiales
router.post('/:id/prestar', controller.prestarLibro);
router.post('/:id/devolver', controller.devolverLibro);

module.exports = router;
```

---

### 3.7 Probar Validaciones
```http
### ✅ Válido
POST http://localhost:3000/libros
Content-Type: application/json

{
  "titulo": "El Principito",
  "autor": "Antoine de Saint-Exupéry",
  "año": 1943,
  "genero": "Ficción"
}

### ❌ Error: Falta título
POST http://localhost:3000/libros
Content-Type: application/json

{
  "autor": "Antoine de Saint-Exupéry",
  "año": 1943,
  "genero": "Ficción"
}

### ❌ Error: Año inválido
POST http://localhost:3000/libros
Content-Type: application/json

{
  "titulo": "Libro del futuro",
  "autor": "Autor",
  "año": 3000,
  "genero": "Ficción"
}

### ❌ Error: Género inválido
POST http://localhost:3000/libros
Content-Type: application/json

{
  "titulo": "Libro",
  "autor": "Autor",
  "año": 2020,
  "genero": "Romance"
}

### ❌ Error: Múltiples errores
POST http://localhost:3000/libros
Content-Type: application/json

{
  "año": 3000,
  "genero": "Romance"
}
```

**Respuesta de error:**
```json
{
  "error": "Error de validación",
  "detalles": [
    "El título es obligatorio",
    "El autor es obligatorio",
    "El año debe ser menor a 2025",
    "El género debe ser uno de: Ficción, No Ficción, Ciencia, Historia, Biografía"
  ]
}
```

---

## 📝 PARTE 4: EJERCICIO FINAL (20 minutos)

### 🎯 Ejercicio: Sistema de Estudiantes con Middlewares y Joi

**Contexto:** Agregar middlewares y validaciones con Joi al sistema de estudiantes.

**Requisitos:**

1. **Crear Middlewares:**
   - `logger.js` - Registrar todas las peticiones
   - `auth.js` - Simular autenticación (solo para crear/eliminar)
   - `errorHandler.js` - Manejo centralizado de errores

2. **Crear Schemas con Joi:**
```javascript
// Modelo de Estudiante
{
  "id": 1,
  "nombre": "Juan Pérez",
  "carrera": "Sistemas",
  "email": "juan@example.com",
  "edad": 20,
  "activo": true
}
```

**Validaciones:**
- `nombre`: String, 3-100 caracteres, obligatorio
- `carrera`: String, uno de ["Sistemas", "Electrónica", "Mecánica", "Química"], obligatorio
- `email`: String, formato email, obligatorio
- `edad`: Number, entre 16 y 80, obligatorio
- `activo`: Boolean, opcional (default true)

3. **Aplicar en Rutas:**
   - POST `/estudiantes` - Con validación
   - PATCH `/estudiantes/:id` - Con validación parcial
   - DELETE `/estudiantes/:id` - Con autenticación

4. **Estructura:**
```
src/
├── middlewares/
│   ├── logger.js
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── validations/
│   └── estudianteSchemas.js
└── routes/
    └── estudianteRoutes.js
```

---

### 📋 Plantilla para Empezar
```javascript
// src/middlewares/logger.js
// TODO: Implementar

// src/middlewares/auth.js
// TODO: Implementar

// src/middlewares/errorHandler.js
// TODO: Implementar

// src/middlewares/validate.js
// TODO: Implementar

// src/validations/estudianteSchemas.js
const Joi = require('joi');

const createEstudianteSchema = Joi.object({
  // TODO: Implementar validaciones
});

const updateEstudianteSchema = Joi.object({
  // TODO: Implementar validaciones
});

module.exports = {
  createEstudianteSchema,
  updateEstudianteSchema
};

// src/routes/estudianteRoutes.js
// TODO: Aplicar middlewares
```

---

### ✅ Checklist

- [ ] Logger registra todas las peticiones
- [ ] Auth protege crear/eliminar estudiantes
- [ ] ErrorHandler maneja errores centralizadamente
- [ ] Validación de email funciona
- [ ] Validación de edad funciona
- [ ] Validación de carrera funciona
- [ ] No se pueden enviar campos extra
- [ ] Mensajes de error son claros

---

## 🎓 SOLUCIÓN DEL EJERCICIO

**Solo mira después de intentarlo:**

### src/middlewares/logger.js
```javascript
function logger(req, res, next) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
}

module.exports = logger;
```

### src/middlewares/auth.js
```javascript
function requireAuth(req, res, next) {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Token requerido' 
        });
    }
    
    if (token !== 'Bearer mi-token-secreto') {
        return res.status(403).json({ 
            error: 'Token inválido' 
        });
    }
    
    req.user = { id: 1, rol: 'admin' };
    next();
}

module.exports = requireAuth;
```

### src/middlewares/errorHandler.js
```javascript
function errorHandler(err, req, res, next) {
    console.error('❌ ERROR:', err.message);
    
    let statusCode = 500;
    let message = err.message || 'Error interno del servidor';
    
    if (err.message.includes('no encontrado')) {
        statusCode = 404;
    } else if (err.message.includes('obligatorio') || 
               err.message.includes('inválido')) {
        statusCode = 400;
    }
    
    res.status(statusCode).json({
        error: message,
        timestamp: new Date().toISOString()
    });
}

module.exports = errorHandler;
```

### src/middlewares/validate.js
```javascript
function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                error: 'Error de validación',
                detalles: errors
            });
        }
        
        req.body = value;
        next();
    };
}

module.exports = validate;
```

### src/validations/estudianteSchemas.js
```javascript
const Joi = require('joi');

const carrerasValidas = ['Sistemas', 'Electrónica', 'Mecánica', 'Química'];

const createEstudianteSchema = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'any.required': 'El nombre es obligatorio'
        }),
    
    carrera: Joi.string()
        .valid(...carrerasValidas)
        .required()
        .messages({
            'any.only': `La carrera debe ser: ${carrerasValidas.join(', ')}`,
            'any.required': 'La carrera es obligatoria'
        }),
    
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'El email debe ser válido',
            'any.required': 'El email es obligatorio'
        }),
    
    edad: Joi.number()
        .integer()
        .min(16)
        .max(80)
        .required()
        .messages({
            'number.min': 'La edad mínima es 16',
            'number.max': 'La edad máxima es 80',
            'any.required': 'La edad es obligatoria'
        }),
    
    activo: Joi.boolean().default(true),
    
    // Campos prohibidos
    id: Joi.forbidden()
});

const updateEstudianteSchema = Joi.object({
    nombre: Joi.string().min(3).max(100),
    carrera: Joi.string().valid(...carrerasValidas),
    email: Joi.string().email(),
    edad: Joi.number().integer().min(16).max(80),
    activo: Joi.boolean()
}).min(1);

module.exports = {
    createEstudianteSchema,
    updateEstudianteSchema
};
```

### src/routes/estudianteRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/estudianteController');
const validate = require('../middlewares/validate');
const requireAuth = require('../middlewares/auth');
const { 
    createEstudianteSchema, 
    updateEstudianteSchema 
} = require('../validations/estudianteSchemas');

// Públicas
router.get('/', controller.getEstudiantes);
router.get('/:id', controller.getEstudianteById);

// Protegidas y validadas
router.post('/', 
    requireAuth,
    validate(createEstudianteSchema), 
    controller.createEstudiante
);

router.patch('/:id', 
    validate(updateEstudianteSchema), 
    controller.updateEstudiante
);

router.delete('/:id', 
    requireAuth, 
    controller.deleteEstudiante
);

module.exports = router;
```

### server.js
```javascript
const express = require('express');
const app = express();

// Middlewares globales
app.use(express.json());

const logger = require('./src/middlewares/logger');
app.use(logger);

// Rutas
const estudianteRoutes = require('./src/routes/estudianteRoutes');
app.use('/estudiantes', estudianteRoutes);

// Middleware de errores AL FINAL
const errorHandler = require('./src/middlewares/errorHandler');
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor en http://localhost:${PORT}`);
});
```

---

## 📚 RESUMEN DE CONCEPTOS CLAVE

### Middlewares
- Funciones que se ejecutan entre request y response
- Tienen 3 parámetros: `(req, res, next)`
- Middlewares de error tienen 4: `(err, req, res, next)`
- Siempre llamar `next()` para continuar
- Usar `next(error)` para pasar errores

### Joi
- Librería para validación de datos
- Define schemas con reglas
- Mensajes de error personalizables
- `validate()` retorna `{ error, value }`
- Opciones: `abortEarly`, `stripUnknown`

### Orden de Middlewares
1. Middlewares globales (logger, cors, etc.)
2. Rutas con sus middlewares específicos
3. Middleware de errores (SIEMPRE AL FINAL)

---

## ✅ Autoevaluación

1. ¿Entiendo qué es un middleware?
2. ¿Sé cuándo usar `next()` vs `next(error)`?
3. ¿Puedo crear middlewares personalizados?
4. ¿Sé crear schemas con Joi?
5. ¿Puedo aplicar validaciones en rutas?
6. ¿Entiendo el orden de los middlewares?

**Si respondiste SÍ:** ¡Estás listo para tu examen! 🎉

**Practica combinando:**
- Arquitectura en capas
- Middlewares personalizados
- Validaciones con Joi

**¡Éxito en tu examen! 🚀**