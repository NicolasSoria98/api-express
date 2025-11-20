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
    return { peliculas: [] };  // ✅ minúscula
  }
}

async function guardarPeliculas(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));  // ✅ 'fs' no 'fdatasync'
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
    res.status(500).json({error: 'Error al leer las películas'});
  }
});

// GET película por ID
app.get('/peliculas/:id', async (req, res) => {
  try {
    const { id } = req.params;  // ✅ Sin paréntesis
    const data = await leerPeliculas();
    const pelicula = data.peliculas.find(p => p.id === parseInt(id));
    
    if (!pelicula) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    
    res.json(pelicula);  // ✅ Variable correcta
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar película' });
  }
});

// GET películas por género
app.get('/peliculas/buscar/genero', async (req, res) => {
  try {
    const { genero } = req.query;  // ✅ Sin paréntesis
    
    if (!genero) {
      return res.status(400).json({ error: 'Debes proporcionar un género' });
    }
    
    const data = await leerPeliculas();
    const resultado = data.peliculas.filter(p =>  // ✅ filter, no find
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
    const { titulo, director, año, calificacion, genero } = req.body;
    
    const nuevaPelicula = {
      titulo,
      director,
      año,
      genero,
      calificacion
    };
    
    // ✅ Validar ANTES de crear el objeto con ID
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
    
    // ✅ ACTUALIZAR la película
    data.peliculas[index] = { ...data.peliculas[index], ...actualizaciones };
    
    // ✅ Validar después de actualizar
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
    await guardarPeliculas(data);  // ✅ Guardar el objeto completo
    
    res.json({ mensaje: 'Película eliminada', pelicula: peliculaEliminada });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar película' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});