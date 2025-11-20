# 📘 CLASE 1: Fundamentos de Express.js

**Profesor:** Bienvenido/a a tu clase intensiva de Express.js. Soy tu instructor y vamos a construir juntos las bases sólidas que necesitas para tu examen de mañana.

**Duración:** 2 horas  
**Objetivo:** Dominar los conceptos fundamentales de Express y manejo de archivos JSON

---

## 🎯 PARTE 1: TEORÍA FUNDAMENTAL (30 minutos)

### 1.1 ¿Qué es Express.js?

**Definición:**  
Express.js es un **framework minimalista** de Node.js para construir aplicaciones web y APIs. Es como el "esqueleto" que nos facilita crear servidores HTTP sin tener que programar todo desde cero.

**¿Por qué usar Express?**
- ✅ Simplifica la creación de rutas y endpoints
- ✅ Facilita el manejo de peticiones HTTP (GET, POST, PATCH, DELETE)
- ✅ Permite usar middlewares (funciones intermedias)
- ✅ Es el estándar de la industria para APIs en Node.js

---

### 1.2 Conceptos Clave de Express

#### **A) Aplicación Express**
```javascript
const express = require('express');
const app = express();
```

- `app` es tu **aplicación/servidor**
- Es el objeto principal que gestiona todo

#### **B) Middleware**
```javascript
app.use(express.json());
```

**Definición:** Un middleware es una función que se ejecuta **entre** la petición (request) y la respuesta (response).

**Analogía:** Piensa en un middleware como un control de seguridad en un aeropuerto:
- La petición (persona) debe pasar por varios controles
- Cada control hace algo específico (revisar pasaporte, equipaje, etc.)
- Finalmente, la persona llega a su destino (respuesta)

**`express.json()`** es un middleware que:
- Lee el cuerpo (body) de las peticiones
- Lo convierte de JSON a un objeto JavaScript
- Lo guarda en `req.body`

#### **C) Rutas (Routes)**
```javascript
app.get('/usuarios', (req, res) => {
  // código
});
```

**Componentes de una ruta:**
1. **Método HTTP:** `get`, `post`, `patch`, `delete`
2. **Path (ruta):** `/usuarios`
3. **Handler (manejador):** Función que se ejecuta `(req, res) => {...}`

#### **D) Request y Response**

**Request (req):**  
Objeto que contiene toda la información de la petición del cliente.
```javascript
req.params   // Parámetros de ruta: /users/:id
req.query    // Parámetros de consulta: /users?name=Juan
req.body     // Cuerpo de la petición (datos enviados)
req.headers  // Encabezados HTTP
```

**Response (res):**  
Objeto que usamos para enviar la respuesta al cliente.
```javascript
res.json()       // Enviar respuesta JSON
res.status()     // Establecer código de estado HTTP
res.send()       // Enviar respuesta de texto
```

#### **E) Códigos de Estado HTTP (Status Codes)**

Debes conocer estos:

| Código | Significado | Cuándo usar |
|--------|-------------|-------------|
| 200 | OK | Petición exitosa (GET) |
| 201 | Created | Recurso creado exitosamente (POST) |
| 400 | Bad Request | Datos inválidos del cliente |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

### 1.3 Node.js File System (fs.promises)

**¿Por qué fs.promises?**  
Porque trabajamos con operaciones **asíncronas**. Leer/escribir archivos toma tiempo, y no queremos bloquear el servidor.

#### **Lectura de archivos:**
```javascript
const fs = require('fs').promises;

async function leerArchivo() {
  try {
    const contenido = await fs.readFile('./archivo.json', 'utf-8');
    const datos = JSON.parse(contenido);
    return datos;
  } catch (error) {
    console.error('Error al leer:', error);
  }
}
```

**Explicación línea por línea:**
1. `fs.readFile()` → Lee el archivo del disco
2. `'utf-8'` → Especifica la codificación (texto legible)
3. `JSON.parse()` → Convierte el texto JSON a objeto JavaScript
4. `await` → Espera a que termine de leer
5. `try-catch` → Maneja errores si el archivo no existe

#### **Escritura de archivos:**
```javascript
async function escribirArchivo(datos) {
  try {
    const textoJSON = JSON.stringify(datos, null, 2);
    await fs.writeFile('./archivo.json', textoJSON);
  } catch (error) {
    console.error('Error al escribir:', error);
  }
}
```

**Explicación:**
1. `JSON.stringify(datos, null, 2)` → Convierte objeto a texto JSON
   - `null` → No usar función de reemplazo
   - `2` → Indentar con 2 espacios (hace el JSON legible)
2. `fs.writeFile()` → Escribe el contenido en el archivo

---

## 💻 PARTE 2: PRÁCTICA GUIADA (60 minutos)

### Ejercicio Guiado 1: Tu Primer Servidor Express

**Instrucciones:** Vamos a crear paso a paso un servidor básico.

#### **Paso 1: Crear el proyecto**
```bash
mkdir practica-express
cd practica-express
npm init -y
npm install express
```

#### **Paso 2: Crear server.js**
```javascript
// server.js
const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Ruta de prueba
app.get('/hola', (req, res) => {
  res.json({ mensaje: 'Hola Mundo desde Express!' });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
```

#### **Paso 3: Ejecutar**
```bash
node server.js
```

**Abrir navegador:** http://localhost:3000/hola

**✅ Checkpoint:** ¿Ves `{"mensaje": "Hola Mundo desde Express!"}`? ¡Perfecto!

---

### Ejercicio Guiado 2: Rutas con Parámetros

Vamos a crear una pequeña API de estudiantes.
```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());

// Base de datos en memoria (simulada)
let estudiantes = [
  { id: 1, nombre: 'Ana', carrera: 'Sistemas' },
  { id: 2, nombre: 'Luis', carrera: 'Electrónica' },
  { id: 3, nombre: 'María', carrera: 'Sistemas' }
];

// GET todos los estudiantes
app.get('/estudiantes', (req, res) => {
  res.json(estudiantes);
});

// GET estudiante por ID (parámetro de ruta)
app.get('/estudiantes/:id', (req, res) => {
  const { id } = req.params;
  const estudiante = estudiantes.find(e => e.id === parseInt(id));
  
  if (!estudiante) {
    return res.status(404).json({ error: 'Estudiante no encontrado' });
  }
  
  res.json(estudiante);
});

// GET estudiantes filtrados por carrera (query params)
app.get('/estudiantes/buscar/carrera', (req, res) => {
  const { carrera } = req.query;
  
  if (!carrera) {
    return res.status(400).json({ error: 'Debes proporcionar una carrera' });
  }
  
  const resultado = estudiantes.filter(e => 
    e.carrera.toLowerCase() === carrera.toLowerCase()
  );
  
  res.json(resultado);
});

// POST crear estudiante
app.post('/estudiantes', (req, res) => {
  const { nombre, carrera } = req.body;
  
  // Validación básica
  if (!nombre || !carrera) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  
  const nuevoEstudiante = {
    id: estudiantes.length + 1,
    nombre,
    carrera
  };
  
  estudiantes.push(nuevoEstudiante);
  
  res.status(201).json(nuevoEstudiante);
});

// PATCH actualizar estudiante
app.patch('/estudiantes/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, carrera } = req.body;
  
  const estudiante = estudiantes.find(e => e.id === parseInt(id));
  
  if (!estudiante) {
    return res.status(404).json({ error: 'Estudiante no encontrado' });
  }
  
  // Actualizar solo lo que venga en el body
  if (nombre) estudiante.nombre = nombre;
  if (carrera) estudiante.carrera = carrera;
  
  res.json(estudiante);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});
```

---

### 🧪 Pruebas con Extensión REST Client (VS Code)

**Instalar:** Busca "REST Client" en extensiones de VS Code

**Crear archivo:** `pruebas.http`
```http
### GET todos los estudiantes
GET http://localhost:3000/estudiantes

### GET estudiante por ID
GET http://localhost:3000/estudiantes/1

### GET estudiantes por carrera (query params)
GET http://localhost:3000/estudiantes/buscar/carrera?carrera=Sistemas

### POST crear estudiante
POST http://localhost:3000/estudiantes
Content-Type: application/json

{
  "nombre": "Pedro",
  "carrera": "Mecánica"
}

### PATCH actualizar estudiante
PATCH http://localhost:3000/estudiantes/2
Content-Type: application/json

{
  "carrera": "Química"
}
```

**Instrucción:** Haz clic en "Send Request" sobre cada prueba y observa las respuestas.

---

### Ejercicio Guiado 3: Persistencia con JSON

Ahora vamos a guardar los estudiantes en un archivo JSON.

#### **Paso 1: Crear carpeta y archivo**
```bash
mkdir data
echo '{"estudiantes":[]}' > data/estudiantes.json
```

#### **Paso 2: Crear funciones de persistencia**
```javascript
// server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const filePath = path.join(__dirname, 'data', 'estudiantes.json');

// FUNCIONES DE PERSISTENCIA
async function leerEstudiantes() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, devolver estructura vacía
    return { estudiantes: [] };
  }
}

async function guardarEstudiantes(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// RUTAS
app.get('/estudiantes', async (req, res) => {
  try {
    const data = await leerEstudiantes();
    res.json(data.estudiantes);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer estudiantes' });
  }
});

app.post('/estudiantes', async (req, res) => {
  try {
    const { nombre, carrera } = req.body;
    
    if (!nombre || !carrera) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    
    const data = await leerEstudiantes();
    
    const nuevoEstudiante = {
      id: data.estudiantes.length > 0 
        ? Math.max(...data.estudiantes.map(e => e.id)) + 1 
        : 1,
      nombre,
      carrera
    };
    
    data.estudiantes.push(nuevoEstudiante);
    await guardarEstudiantes(data);
    
    res.status(201).json(nuevoEstudiante);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear estudiante' });
  }
});

app.get('/estudiantes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await leerEstudiantes();
    const estudiante = data.estudiantes.find(e => e.id === parseInt(id));
    
    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    res.json(estudiante);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar estudiante' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});
```

**🎓 Conceptos clave aplicados:**
- ✅ Async/await para operaciones asíncronas
- ✅ Try-catch para manejo de errores
- ✅ Lectura y escritura de JSON
- ✅ Generación de IDs únicos
- ✅ Códigos de estado HTTP apropiados

---

## 📝 PARTE 3: EJERCICIO FINAL (30 minutos)

### 🎯 Ejercicio: API de Películas

**Contexto:** Vas a crear una API completa para gestionar películas.

**Requisitos:**

1. **Estructura del JSON:**
```json
{
  "peliculas": []
}
```

2. **Modelo de Película:**
```javascript
{
  "id": 1,
  "titulo": "Matrix",
  "director": "Wachowski",
  "año": 1999,
  "genero": "Ciencia Ficción",
  "calificacion": 8.7
}
```

3. **Endpoints a implementar:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/peliculas` | Obtener todas las películas |
| GET | `/peliculas/:id` | Obtener película por ID |
| GET | `/peliculas/buscar/genero?genero=x` | Filtrar por género |
| GET | `/peliculas/buscar/año?año=x` | Filtrar por año |
| POST | `/peliculas` | Crear película |
| PATCH | `/peliculas/:id` | Actualizar película |
| DELETE | `/peliculas/:id` | Eliminar película |

4. **Validaciones:**
   - Título y director son obligatorios
   - Año debe estar entre 1900 y 2025
   - Calificación debe estar entre 0 y 10
   - Género debe ser uno de: "Acción", "Comedia", "Drama", "Terror", "Ciencia Ficción"

---

### 📋 Plantilla para Empezar
```javascript
// server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const filePath = path.join(__dirname, 'data', 'peliculas.json');

// Funciones auxiliares
async function leerPeliculas() {
  // TODO: Implementar
}

async function guardarPeliculas(data) {
  // TODO: Implementar
}

// Rutas
app.get('/peliculas', async (req, res) => {
  // TODO: Implementar
});

app.get('/peliculas/:id', async (req, res) => {
  // TODO: Implementar
});

app.get('/peliculas/buscar/genero', async (req, res) => {
  // TODO: Implementar
});

app.post('/peliculas', async (req, res) => {
  // TODO: Implementar validaciones
});

app.patch('/peliculas/:id', async (req, res) => {
  // TODO: Implementar
});

app.delete('/peliculas/:id', async (req, res) => {
  // TODO: Implementar
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
```

---

### ✅ Checklist de Verificación

Cuando termines, verifica que:

- [ ] El servidor inicia sin errores
- [ ] Puedes crear una película con POST
- [ ] Las películas se guardan en el JSON
- [ ] Puedes obtener todas las películas
- [ ] Puedes buscar por ID
- [ ] Los filtros por género y año funcionan
- [ ] Puedes actualizar una película
- [ ] Puedes eliminar una película
- [ ] Las validaciones funcionan correctamente
- [ ] Los códigos de estado HTTP son correctos

---

## 🎓 SOLUCIÓN DEL EJERCICIO FINAL

**Solo mira esto después de intentarlo tú mismo/a:**
```javascript
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const filePath = path.join(__dirname, 'data', 'peliculas.json');
const generosValidos = ["Acción", "Comedia", "Drama", "Terror", "Ciencia Ficción"];

// Funciones auxiliares
async function leerPeliculas() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { peliculas: [] };
  }
}

async function guardarPeliculas(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function validarPelicula(pelicula) {
  if (!pelicula.titulo || !pelicula.director) {
    return 'Título y director son obligatorios';
  }
  
  if (pelicula.año < 1900 || pelicula.año > 2025) {
    return 'El año debe estar entre 1900 y 2025';
  }
  
  if (pelicula.calificacion < 0 || pelicula.calificacion > 10) {
    return 'La calificación debe estar entre 0 y 10';
  }
  
  if (!generosValidos.includes(pelicula.genero)) {
    return `Género debe ser uno de: ${generosValidos.join(', ')}`;
  }
  
  return null;
}

// GET todas las películas
app.get('/peliculas', async (req, res) => {
  try {
    const data = await leerPeliculas();
    res.json(data.peliculas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener películas' });
  }
});

// GET película por ID
app.get('/peliculas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await leerPeliculas();
    const pelicula = data.peliculas.find(p => p.id === parseInt(id));
    
    if (!pelicula) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    
    res.json(pelicula);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar película' });
  }
});

// GET películas por género
app.get('/peliculas/buscar/genero', async (req, res) => {
  try {
    const { genero } = req.query;
    
    if (!genero) {
      return res.status(400).json({ error: 'Debes proporcionar un género' });
    }
    
    const data = await leerPeliculas();
    const resultado = data.peliculas.filter(p => 
      p.genero.toLowerCase() === genero.toLowerCase()
    );
    
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar películas' });
  }
});

// GET películas por año
app.get('/peliculas/buscar/año', async (req, res) => {
  try {
    const { año } = req.query;
    
    if (!año) {
      return res.status(400).json({ error: 'Debes proporcionar un año' });
    }
    
    const data = await leerPeliculas();
    const resultado = data.peliculas.filter(p => p.año === parseInt(año));
    
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar películas' });
  }
});

// POST crear película
app.post('/peliculas', async (req, res) => {
  try {
    const { titulo, director, año, genero, calificacion } = req.body;
    
    const nuevaPelicula = { titulo, director, año, genero, calificacion };
    
    // Validar
    const errorValidacion = validarPelicula(nuevaPelicula);
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }
    
    const data = await leerPeliculas();
    
    nuevaPelicula.id = data.peliculas.length > 0 
      ? Math.max(...data.peliculas.map(p => p.id)) + 1 
      : 1;
    
    data.peliculas.push(nuevaPelicula);
    await guardarPeliculas(data);
    
    res.status(201).json(nuevaPelicula);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear película' });
  }
});

// PATCH actualizar película
app.patch('/peliculas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const actualizaciones = req.body;
    
    const data = await leerPeliculas();
    const index = data.peliculas.findIndex(p => p.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    
    // Aplicar actualizaciones
    data.peliculas[index] = { ...data.peliculas[index], ...actualizaciones };
    
    // Validar película actualizada
    const errorValidacion = validarPelicula(data.peliculas[index]);
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }
    
    await guardarPeliculas(data);
    
    res.json(data.peliculas[index]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar película' });
  }
});

// DELETE eliminar película
app.delete('/peliculas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await leerPeliculas();
    const index = data.peliculas.findIndex(p => p.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    
    const peliculaEliminada = data.peliculas.splice(index, 1)[0];
    await guardarPeliculas(data);
    
    res.json({ mensaje: 'Película eliminada', pelicula: peliculaEliminada });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar película' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
```

---

## 📚 RESUMEN DE CONCEPTOS CLAVE

### Express
- Framework para crear servidores HTTP
- Simplifica el manejo de rutas y peticiones
- Usa el patrón middleware

### Middlewares
- Funciones que procesan peticiones
- Se ejecutan en orden
- `express.json()` parsea el body

### Rutas
- Definen endpoints de la API
- Combinan método HTTP + path + handler
- Usan `req` y `res`

### Request
- `req.params` → Parámetros de ruta
- `req.query` → Query strings
- `req.body` → Cuerpo de la petición

### Response
- `res.json()` → Enviar JSON
- `res.status()` → Código HTTP
- `res.send()` → Enviar texto

### File System
- `fs.readFile()` → Leer archivos
- `fs.writeFile()` → Escribir archivos
- Usar `async/await` y `try-catch`

---

## ✅ Autoevaluación

Responde honestamente:

1. ¿Puedo crear un servidor Express básico? 
2. ¿Entiendo qué es un middleware?
3. ¿Sé usar req.params, req.query y req.body?
4. ¿Puedo leer y escribir archivos JSON?
5. ¿Entiendo los códigos de estado HTTP?

**Si respondiste SÍ a todas:** ¡Estás listo/a para la Clase 2!

**Nos vemos en la siguiente clase donde aprenderemos arquitectura en capas. ¡Excelente trabajo! 🎉**