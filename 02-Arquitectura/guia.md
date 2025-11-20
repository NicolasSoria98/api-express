# 📘 CLASE 2: Arquitectura en Capas (Repository-Service-Controller)

**Profesor:** Bienvenido/a a la Clase 2. Ahora que dominas Express básico, vamos a aprender a organizar el código de forma **profesional** usando arquitectura en capas. Esto es CRÍTICO para tu examen.

**Duración:** 2.5 horas  
**Objetivo:** Separar responsabilidades en capas (Repository, Service, Controller, Routes)

---

## 🎯 PARTE 1: TEORÍA FUNDAMENTAL (40 minutos)

### 1.1 ¿Por qué NO poner todo en server.js?

#### ❌ PROBLEMA: Código Monolítico (Todo en un archivo)
```javascript
// server.js con TODO mezclado
app.post('/estudiantes', async (req, res) => {
  try {
    // Lectura de archivo (persistencia)
    const data = await fs.readFile('./data.json', 'utf-8');
    const parsed = JSON.parse(data);
    
    // Validación
    if (!req.body.nombre) return res.status(400).json({error: 'Falta nombre'});
    
    // Lógica de negocio
    const nuevoId = parsed.estudiantes.length + 1;
    
    // Escritura de archivo (persistencia)
    parsed.estudiantes.push({id: nuevoId, ...req.body});
    await fs.writeFile('./data.json', JSON.stringify(parsed));
    
    // Respuesta
    res.json(nuevoEstudiante);
  } catch (error) {
    res.status(500).json({error: 'Error'});
  }
});
```

**Problemas:**
- 🔴 Todo mezclado: persistencia + validación + lógica + respuesta
- 🔴 Difícil de testear
- 🔴 Duplicación de código
- 🔴 Imposible de mantener
- 🔴 No se puede reutilizar

---

### 1.2 La Solución: Arquitectura en Capas

**Concepto:** Separar el código en capas, donde cada capa tiene **UNA responsabilidad específica**.
```
┌─────────────────────────────────────┐
│         ROUTES (Rutas)              │  ← Define endpoints
│  /estudiantes, /peliculas, etc.     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      CONTROLLERS (Controladores)    │  ← Maneja req/res
│  Recibe petición, llama service     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       SERVICES (Servicios)          │  ← Lógica de negocio
│  Validaciones, cálculos, reglas     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    REPOSITORIES (Repositorios)      │  ← Acceso a datos
│  Lee/escribe JSON (o base de datos) │
└─────────────────────────────────────┘
```

---

### 1.3 Responsabilidad de Cada Capa

#### **CAPA 1: REPOSITORY (Repositorio)**

**Responsabilidad:** SOLO leer y escribir datos (JSON, base de datos, etc.)

**NO puede:**
- ❌ Tener validaciones
- ❌ Tener lógica de negocio
- ❌ Conocer sobre HTTP (req, res)

**SÍ puede:**
- ✅ Leer archivos
- ✅ Escribir archivos
- ✅ Hacer consultas básicas (find, filter)

**Ejemplo:**
```javascript
// repositories/estudianteRepository.js
async function getAllEstudiantes() {
  const data = await readData();
  return data.estudiantes;
}

async function getEstudianteById(id) {
  const data = await readData();
  return data.estudiantes.find(e => e.id === id);
}

async function createEstudiante(estudiante) {
  const data = await readData();
  data.estudiantes.push(estudiante);
  await saveData(data);
  return estudiante;
}
```

---

#### **CAPA 2: SERVICE (Servicio)**

**Responsabilidad:** Lógica de negocio, validaciones, cálculos

**NO puede:**
- ❌ Conocer sobre HTTP (req, res)
- ❌ Leer/escribir archivos directamente
- ❌ Saber de dónde vienen los datos

**SÍ puede:**
- ✅ Validar datos
- ✅ Hacer cálculos
- ✅ Aplicar reglas de negocio
- ✅ Llamar al repository
- ✅ Lanzar errores personalizados

**Ejemplo:**
```javascript
// services/estudianteService.js
async function createEstudiante(data) {
  // Validaciones
  if (!data.nombre || !data.carrera) {
    throw new Error('Faltan datos obligatorios');
  }
  
  // Lógica de negocio
  const estudiante = {
    nombre: data.nombre,
    carrera: data.carrera,
    nivel: 1,
    puntos: 0
  };
  
  // Generar ID
  const todosLosEstudiantes = await repository.getAllEstudiantes();
  estudiante.id = todosLosEstudiantes.length > 0
    ? Math.max(...todosLosEstudiantes.map(e => e.id)) + 1
    : 1;
  
  // Guardar
  return await repository.createEstudiante(estudiante);
}
```

---

#### **CAPA 3: CONTROLLER (Controlador)**

**Responsabilidad:** Manejar la petición HTTP y la respuesta

**NO puede:**
- ❌ Tener validaciones
- ❌ Tener lógica de negocio
- ❌ Leer/escribir archivos

**SÍ puede:**
- ✅ Recibir req, res
- ✅ Extraer datos de req.body, req.params, req.query
- ✅ Llamar al service
- ✅ Enviar respuestas con códigos HTTP
- ✅ Manejar errores

**Ejemplo:**
```javascript
// controllers/estudianteController.js
async function createEstudiante(req, res, next) {
  try {
    const estudiante = await estudianteService.createEstudiante(req.body);
    res.status(201).json(estudiante);
  } catch (error) {
    next(error);  // Pasar error al middleware de errores
  }
}
```

---

#### **CAPA 4: ROUTES (Rutas)**

**Responsabilidad:** Definir los endpoints y conectarlos con controllers

**Ejemplo:**
```javascript
// routes/estudianteRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/estudianteController');

router.get('/', controller.getEstudiantes);
router.get('/:id', controller.getEstudianteById);
router.post('/', controller.createEstudiante);

module.exports = router;
```

---

### 1.4 Flujo Completo de una Petición
```
1. CLIENTE hace request
   POST /estudiantes
   Body: { nombre: "Juan", carrera: "Sistemas" }
   
   ↓

2. ROUTE recibe y dirige
   router.post('/', controller.createEstudiante)
   
   ↓

3. CONTROLLER extrae datos
   const estudiante = await service.createEstudiante(req.body)
   
   ↓

4. SERVICE valida y procesa
   - Valida nombre y carrera
   - Genera ID
   - Llama al repository
   
   ↓

5. REPOSITORY guarda
   - Lee JSON
   - Agrega estudiante
   - Escribe JSON
   
   ↓

6. REPOSITORY devuelve al SERVICE
   return estudiante
   
   ↓

7. SERVICE devuelve al CONTROLLER
   return estudiante
   
   ↓

8. CONTROLLER responde al CLIENTE
   res.status(201).json(estudiante)
```

---

### 1.5 Estructura de Carpetas
```
proyecto/
├── src/
│   ├── routes/
│   │   ├── estudianteRoutes.js
│   │   └── peliculaRoutes.js
│   ├── controllers/
│   │   ├── estudianteController.js
│   │   └── peliculaController.js
│   ├── services/
│   │   ├── estudianteService.js
│   │   └── peliculaService.js
│   ├── repositories/
│   │   └── dataRepository.js
│   └── utils/
│       └── helpers.js
├── data/
│   └── data.json
└── server.js
```

---

## 💻 PARTE 2: PRÁCTICA GUIADA (90 minutos)

### Ejercicio Guiado: Sistema de Estudiantes con Arquitectura en Capas

Vamos a convertir el código monolítico en arquitectura en capas.

---

#### **PASO 1: Crear Estructura de Carpetas (5 min)**
```bash
mkdir -p src/routes src/controllers src/services src/repositories src/utils data
touch src/repositories/dataRepository.js
touch src/services/estudianteService.js
touch src/controllers/estudianteController.js
touch src/routes/estudianteRoutes.js
touch server.js
echo '{"estudiantes":[]}' > data/data.json
```

---

#### **PASO 2: Repository - Acceso a Datos (15 min)**
```javascript
// src/repositories/dataRepository.js
const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, '../../data/data.json');

// ============================================
// FUNCIONES PRIVADAS (helper functions)
// ============================================
async function readData() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { estudiantes: [] };
  }
}

async function saveData(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// ============================================
// ESTUDIANTES - Funciones públicas
// ============================================

async function getAllEstudiantes() {
  const data = await readData();
  return data.estudiantes;
}

async function getEstudianteById(id) {
  const data = await readData();
  return data.estudiantes.find(e => e.id === parseInt(id));
}

async function createEstudiante(estudiante) {
  const data = await readData();
  data.estudiantes.push(estudiante);
  await saveData(data);
  return estudiante;
}

async function updateEstudiante(id, updates) {
  const data = await readData();
  const index = data.estudiantes.findIndex(e => e.id === parseInt(id));
  
  if (index === -1) return null;
  
  data.estudiantes[index] = { ...data.estudiantes[index], ...updates };
  await saveData(data);
  return data.estudiantes[index];
}

async function deleteEstudiante(id) {
  const data = await readData();
  const index = data.estudiantes.findIndex(e => e.id === parseInt(id));
  
  if (index === -1) return null;
  
  const eliminado = data.estudiantes.splice(index, 1)[0];
  await saveData(data);
  return eliminado;
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  getAllEstudiantes,
  getEstudianteById,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante
};
```

**🎓 Conceptos clave:**
- ✅ Solo maneja lectura/escritura
- ✅ No tiene validaciones
- ✅ No conoce HTTP
- ✅ Funciones privadas (readData, saveData)
- ✅ Funciones públicas exportadas

---

#### **PASO 3: Service - Lógica de Negocio (20 min)**
```javascript
// src/services/estudianteService.js
const repository = require('../repositories/dataRepository');

// ============================================
// CREATE - Crear estudiante
// ============================================
async function createEstudiante(data) {
  // Validación 1: Datos obligatorios
  if (!data.nombre || !data.carrera) {
    throw new Error('Nombre y carrera son obligatorios');
  }
  
  // Validación 2: Nombre mínimo 3 caracteres
  if (data.nombre.length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres');
  }
  
  // Lógica de negocio: Crear objeto completo
  const estudiante = {
    nombre: data.nombre.trim(),
    carrera: data.carrera.trim(),
    nivel: 1,
    puntos: 0,
    activo: true
  };
  
  // Generar ID único
  const todos = await repository.getAllEstudiantes();
  estudiante.id = todos.length > 0
    ? Math.max(...todos.map(e => e.id)) + 1
    : 1;
  
  // Guardar
  return await repository.createEstudiante(estudiante);
}

// ============================================
// READ - Obtener estudiantes
// ============================================
async function getEstudiantes(filters = {}) {
  let estudiantes = await repository.getAllEstudiantes();
  
  // Filtro por carrera
  if (filters.carrera) {
    estudiantes = estudiantes.filter(e => 
      e.carrera.toLowerCase() === filters.carrera.toLowerCase()
    );
  }
  
  // Filtro por nombre (búsqueda parcial)
  if (filters.nombre) {
    estudiantes = estudiantes.filter(e => 
      e.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
    );
  }
  
  // Filtro por nivel
  if (filters.nivel) {
    estudiantes = estudiantes.filter(e => e.nivel === parseInt(filters.nivel));
  }
  
  // Filtro por activo
  if (filters.activo !== undefined) {
    const esActivo = filters.activo === 'true';
    estudiantes = estudiantes.filter(e => e.activo === esActivo);
  }
  
  return estudiantes;
}

async function getEstudianteById(id) {
  const estudiante = await repository.getEstudianteById(id);
  
  if (!estudiante) {
    throw new Error('Estudiante no encontrado');
  }
  
  return estudiante;
}

// ============================================
// UPDATE - Actualizar estudiante
// ============================================
async function updateEstudiante(id, updates) {
  // Verificar que existe
  const existe = await repository.getEstudianteById(id);
  if (!existe) {
    throw new Error('Estudiante no encontrado');
  }
  
  // Validar campos si vienen
  if (updates.nombre && updates.nombre.length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres');
  }
  
  // Actualizar
  return await repository.updateEstudiante(id, updates);
}

// ============================================
// DELETE - Eliminar estudiante
// ============================================
async function deleteEstudiante(id) {
  const eliminado = await repository.deleteEstudiante(id);
  
  if (!eliminado) {
    throw new Error('Estudiante no encontrado');
  }
  
  return eliminado;
}

// ============================================
// LÓGICA ESPECIAL - Subir de nivel
// ============================================
async function subirNivel(id) {
  const estudiante = await repository.getEstudianteById(id);
  
  if (!estudiante) {
    throw new Error('Estudiante no encontrado');
  }
  
  // Lógica: Necesita 100 puntos por nivel
  const puntosNecesarios = estudiante.nivel * 100;
  
  if (estudiante.puntos < puntosNecesarios) {
    throw new Error(`Necesitas ${puntosNecesarios} puntos para subir de nivel`);
  }
  
  // Subir nivel y resetear puntos
  const updates = {
    nivel: estudiante.nivel + 1,
    puntos: estudiante.puntos - puntosNecesarios
  };
  
  return await repository.updateEstudiante(id, updates);
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  createEstudiante,
  getEstudiantes,
  getEstudianteById,
  updateEstudiante,
  deleteEstudiante,
  subirNivel
};
```

**🎓 Conceptos clave:**
- ✅ Validaciones aquí
- ✅ Lógica de negocio (subir nivel)
- ✅ Filtros complejos
- ✅ Lanza errores con `throw new Error()`
- ✅ No conoce HTTP

---

#### **PASO 4: Controller - Manejo de HTTP (15 min)**
```javascript
// src/controllers/estudianteController.js
const estudianteService = require('../services/estudianteService');

// ============================================
// CREATE
// ============================================
async function createEstudiante(req, res, next) {
  try {
    const estudiante = await estudianteService.createEstudiante(req.body);
    res.status(201).json(estudiante);
  } catch (error) {
    next(error);
  }
}

// ============================================
// READ
// ============================================
async function getEstudiantes(req, res, next) {
  try {
    const filters = req.query;
    const estudiantes = await estudianteService.getEstudiantes(filters);
    res.json(estudiantes);
  } catch (error) {
    next(error);
  }
}

async function getEstudianteById(req, res, next) {
  try {
    const { id } = req.params;
    const estudiante = await estudianteService.getEstudianteById(id);
    res.json(estudiante);
  } catch (error) {
    next(error);
  }
}

// ============================================
// UPDATE
// ============================================
async function updateEstudiante(req, res, next) {
  try {
    const { id } = req.params;
    const estudiante = await estudianteService.updateEstudiante(id, req.body);
    res.json(estudiante);
  } catch (error) {
    next(error);
  }
}

// ============================================
// DELETE
// ============================================
async function deleteEstudiante(req, res, next) {
  try {
    const { id } = req.params;
    const eliminado = await estudianteService.deleteEstudiante(id);
    res.json({ 
      mensaje: 'Estudiante eliminado', 
      estudiante: eliminado 
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// CUSTOM - Subir nivel
// ============================================
async function subirNivel(req, res, next) {
  try {
    const { id } = req.params;
    const estudiante = await estudianteService.subirNivel(id);
    res.json(estudiante);
  } catch (error) {
    next(error);
  }
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  createEstudiante,
  getEstudiantes,
  getEstudianteById,
  updateEstudiante,
  deleteEstudiante,
  subirNivel
};
```

**🎓 Conceptos clave:**
- ✅ Solo maneja req/res
- ✅ Extrae datos de req
- ✅ Llama al service
- ✅ Envía respuestas
- ✅ Usa `next(error)` para errores

---

#### **PASO 5: Routes - Definir Endpoints (10 min)**
```javascript
// src/routes/estudianteRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/estudianteController');

// CRUD básico
router.get('/', controller.getEstudiantes);
router.get('/:id', controller.getEstudianteById);
router.post('/', controller.createEstudiante);
router.patch('/:id', controller.updateEstudiante);
router.delete('/:id', controller.deleteEstudiante);

// Rutas especiales
router.post('/:id/subir-nivel', controller.subirNivel);

module.exports = router;
```

---

#### **PASO 6: Server.js - Ensamblar Todo (10 min)**
```javascript
// server.js
const express = require('express');
const app = express();

// Middlewares globales
app.use(express.json());

// Rutas
const estudianteRoutes = require('./src/routes/estudianteRoutes');
app.use('/estudiantes', estudianteRoutes);

// Middleware de errores (SIEMPRE AL FINAL)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).json({ error: err.message });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});
```

---

### 🧪 PROBAR EL SISTEMA

Crea `pruebas.http`:
```http
### 1. Crear estudiante
POST http://localhost:3000/estudiantes
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "carrera": "Sistemas"
}

### 2. Obtener todos
GET http://localhost:3000/estudiantes

### 3. Filtrar por carrera
GET http://localhost:3000/estudiantes?carrera=Sistemas

### 4. Obtener por ID
GET http://localhost:3000/estudiantes/1

### 5. Actualizar estudiante
PATCH http://localhost:3000/estudiantes/1
Content-Type: application/json

{
  "puntos": 150
}

### 6. Subir de nivel
POST http://localhost:3000/estudiantes/1/subir-nivel

### 7. Eliminar estudiante
DELETE http://localhost:3000/estudiantes/1

### 8. Error: Crear sin nombre
POST http://localhost:3000/estudiantes
Content-Type: application/json

{
  "carrera": "Sistemas"
}
```

---

## 📝 PARTE 3: EJERCICIO FINAL (30 minutos)

### 🎯 Ejercicio: Sistema de Libros con Arquitectura en Capas

**Requisitos:**

1. **Modelo de Libro:**
```javascript
{
  "id": 1,
  "titulo": "1984",
  "autor": "George Orwell",
  "año": 1949,
  "genero": "Ficción",
  "disponible": true,
  "prestamos": 0
}
```

2. **Endpoints:**
- GET `/libros` - Todos los libros (con filtros)
- GET `/libros/:id` - Libro por ID
- POST `/libros` - Crear libro
- PATCH `/libros/:id` - Actualizar libro
- DELETE `/libros/:id` - Eliminar libro
- POST `/libros/:id/prestar` - Prestar libro
- POST `/libros/:id/devolver` - Devolver libro

3. **Validaciones:**
- Título y autor obligatorios
- Año entre 1000 y 2025
- Género: "Ficción", "No Ficción", "Ciencia", "Historia", "Biografía"

4. **Lógica de negocio:**
- Solo se puede prestar si `disponible === true`
- Al prestar: `disponible = false`, `prestamos++`
- Al devolver: `disponible = true`

5. **Arquitectura:**
```
src/
├── repositories/
│   └── libroRepository.js
├── services/
│   └── libroService.js
├── controllers/
│   └── libroController.js
└── routes/
    └── libroRoutes.js
```

---

### 📋 Plantilla
```javascript
// src/repositories/libroRepository.js
// TODO: Implementar funciones CRUD básicas

// src/services/libroService.js
// TODO: Implementar validaciones y lógica de préstamo

// src/controllers/libroController.js
// TODO: Implementar controladores

// src/routes/libroRoutes.js
// TODO: Definir rutas

// server.js
// TODO: Ensamblar la aplicación
```

---

### ✅ Checklist

- [ ] Repository solo maneja datos
- [ ] Service tiene todas las validaciones
- [ ] Controller solo maneja req/res
- [ ] Routes define endpoints
- [ ] Lógica de préstamo funciona
- [ ] No se puede prestar libro no disponible
- [ ] Errores se manejan correctamente

---

## 🎓 SOLUCIÓN DEL EJERCICIO

**Solo mira después de intentarlo:**

### src/repositories/libroRepository.js
```javascript
const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, '../../data/libros.json');

async function readData() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { libros: [] };
  }
}

async function saveData(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function getAllLibros() {
  const data = await readData();
  return data.libros;
}

async function getLibroById(id) {
  const data = await readData();
  return data.libros.find(l => l.id === parseInt(id));
}

async function createLibro(libro) {
  const data = await readData();
  data.libros.push(libro);
  await saveData(data);
  return libro;
}

async function updateLibro(id, updates) {
  const data = await readData();
  const index = data.libros.findIndex(l => l.id === parseInt(id));
  if (index === -1) return null;
  
  data.libros[index] = { ...data.libros[index], ...updates };
  await saveData(data);
  return data.libros[index];
}

async function deleteLibro(id) {
  const data = await readData();
  const index = data.libros.findIndex(l => l.id === parseInt(id));
  if (index === -1) return null;
  
  const eliminado = data.libros.splice(index, 1)[0];
  await saveData(data);
  return eliminado;
}

module.exports = {
  getAllLibros,
  getLibroById,
  createLibro,
  updateLibro,
  deleteLibro
};
```

### src/services/libroService.js
```javascript
const repository = require('../repositories/libroRepository');

const generosValidos = ["Ficción", "No Ficción", "Ciencia", "Historia", "Biografía"];

function validarLibro(libro) {
  if (!libro.titulo || !libro.autor) {
    throw new Error('Título y autor son obligatorios');
  }
  
  if (libro.año < 1000 || libro.año > 2025) {
    throw new Error('El año debe estar entre 1000 y 2025');
  }
  
  if (!generosValidos.includes(libro.genero)) {
    throw new Error(`Género debe ser: ${generosValidos.join(', ')}`);
  }
}

async function createLibro(data) {
  const libro = {
    titulo: data.titulo,
    autor: data.autor,
    año: data.año,
    genero: data.genero,
    disponible: true,
    prestamos: 0
  };
  
  validarLibro(libro);
  
  const todos = await repository.getAllLibros();
  libro.id = todos.length > 0
    ? Math.max(...todos.map(l => l.id)) + 1
    : 1;
  
  return await repository.createLibro(libro);
}

async function getLibros(filters = {}) {
  let libros = await repository.getAllLibros();
  
  if (filters.genero) {
    libros = libros.filter(l => 
      l.genero.toLowerCase() === filters.genero.toLowerCase()
    );
  }
  
  if (filters.disponible !== undefined) {
    const esDisponible = filters.disponible === 'true';
    libros = libros.filter(l => l.disponible === esDisponible);
  }
  
  if (filters.autor) {
    libros = libros.filter(l => 
      l.autor.toLowerCase().includes(filters.autor.toLowerCase())
    );
  }
  
  return libros;
}

async function getLibroById(id) {
  const libro = await repository.getLibroById(id);
  if (!libro) {
    throw new Error('Libro no encontrado');
  }
  return libro;
}

async function updateLibro(id, updates) {
  const existe = await repository.getLibroById(id);
  if (!existe) {
    throw new Error('Libro no encontrado');
  }
  
  return await repository.updateLibro(id, updates);
}

async function deleteLibro(id) {
  const eliminado = await repository.deleteLibro(id);
  if (!eliminado) {
    throw new Error('Libro no encontrado');
  }
  return eliminado;
}

async function prestarLibro(id) {
  const libro = await repository.getLibroById(id);
  
  if (!libro) {
    throw new Error('Libro no encontrado');
  }
  
  if (!libro.disponible) {
    throw new Error('El libro no está disponible para préstamo');
  }
  
  const updates = {
    disponible: false,
    prestamos: libro.prestamos + 1
  };
  
  return await repository.updateLibro(id, updates);
}

async function devolverLibro(id) {
  const libro = await repository.getLibroById(id);
  
  if (!libro) {
    throw new Error('Libro no encontrado');
  }
  
  if (libro.disponible) {
    throw new Error('El libro ya está disponible');
  }
  
  const updates = {
    disponible: true
  };
  
  return await repository.updateLibro(id, updates);
}

module.exports = {
  createLibro,
  getLibros,
  getLibroById,
  updateLibro,
  deleteLibro,
  prestarLibro,
  devolverLibro
};
```

### src/controllers/libroController.js
```javascript
const libroService = require('../services/libroService');

async function createLibro(req, res, next) {
  try {
    const libro = await libroService.createLibro(req.body);
    res.status(201).json(libro);
  } catch (error) {
    next(error);
  }
}

async function getLibros(req, res, next) {
  try {
    const libros = await libroService.getLibros(req.query);
    res.json(libros);
  } catch (error) {
    next(error);
  }
}

async function getLibroById(req, res, next) {
  try {
    const libro = await libroService.getLibroById(req.params.id);
    res.json(libro);
  } catch (error) {
    next(error);
  }
}

async function updateLibro(req, res, next) {
  try {
    const libro = await libroService.updateLibro(req.params.id, req.body);
    res.json(libro);
  } catch (error) {
    next(error);
  }
}

async function deleteLibro(req, res, next) {
  try {
    const eliminado = await libroService.deleteLibro(req.params.id);
    res.json({ mensaje: 'Libro eliminado', libro: eliminado });
  } catch (error) {
    next(error);
  }
}

async function prestarLibro(req, res, next) {
  try {
    const libro = await libroService.prestarLibro(req.params.id);
    res.json(libro);
  } catch (error) {
    next(error);
  }
}

async function devolverLibro(req, res, next) {
  try {
    const libro = await libroService.devolverLibro(req.params.id);
    res.json(libro);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createLibro,
  getLibros,
  getLibroById,
  updateLibro,
  deleteLibro,
  prestarLibro,
  devolverLibro
};
```

### src/routes/libroRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/libroController');

router.get('/', controller.getLibros);
router.get('/:id', controller.getLibroById);
router.post('/', controller.createLibro);
router.patch('/:id', controller.updateLibro);
router.delete('/:id', controller.deleteLibro);

router.post('/:id/prestar', controller.prestarLibro);
router.post('/:id/devolver', controller.devolverLibro);

module.exports = router;
```

### server.js
```javascript
const express = require('express');
const app = express();

app.use(express.json());

const libroRoutes = require('./src/routes/libroRoutes');
app.use('/libros', libroRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).json({ error: err.message });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});
```

---

## 📚 RESUMEN DE CONCEPTOS

### Repository
- Solo acceso a datos
- Lee/escribe archivos
- No validaciones ni lógica

### Service
- Lógica de negocio
- Validaciones
- Cálculos y reglas
- Llama al repository

### Controller
- Maneja req/res
- Extrae datos
- Llama al service
- Envía respuestas

### Routes
- Define endpoints
- Conecta con controllers

---

## ✅ Autoevaluación

1. ¿Puedo separar código en capas?
2. ¿Entiendo la responsabilidad de cada capa?
3. ¿Sé dónde poner validaciones?
4. ¿Sé dónde poner lógica de negocio?
5. ¿Puedo crear una API completa con arquitectura?

**Si respondiste SÍ:** ¡Listo para la Clase 3! (Middlewares y Validaciones con Joi)

**¡Excelente progreso! 🚀**