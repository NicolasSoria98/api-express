const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const filePath = path.join(__dirname, 'data', 'peliculas.json');

// Funciones auxiliares
async function leerPeliculas() {
  try {
    const data= await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data)
  } catch (error) {
    return {peliculas: []}
  }
}

async function guardarPeliculas(data) {
  await fsdatasync.writeFile(filePath, JSON.stringify(data,null,2))
}

// Rutas
app.get('/peliculas', async (req, res) => {
  try {
    const data = await leerPeliculas();
    res.json(data.peliculas);
  } catch {
    res.status(500).json({error: "error al leer las peliculas"})
  }
});

app.get('/peliculas/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const data = await leerPeliculas();
    const pelicula = data.peliculas.find(e => e.id === parseInt(id));
    if (!pelicula) {
        return res.status(404).json ({ error: "estudiante no encontrado"})
    }
    res.json(pelicula)
  } catch (error){
    res.status(500).json({error : 'error al buscar estudiante'})
  }
});

app.get('/peliculas/buscar/genero', async (req, res) => {
  const {genero} = req.query;
  if(!genero) {
    return res.status(400).json ({ error: 'Debes proporcionar una carrera'})
  }
  const data = await leerPeliculas();
  const pelicula = data.peliculas.find(e => e.genero.toLowerCase() === genero.toLowerCase())
  res.json(pelicula)
});
// 4. **Validaciones:**
//    - Título y director son obligatorios
//    - Año debe estar entre 1900 y 2025
//    - Calificación debe estar entre 0 y 10
//    - Género debe ser uno de: "Acción", "Comedia", "Drama", "Terror", "Ciencia Ficción"

app.post('/peliculas', async (req, res) => {
  try {
    const {titulo, director, año, calificacion, genero} = req.body;
    if(!titulo || !director) {
        return res.status(400).json ({error: 'te faltan datos obligatorios'})
    }
    const data = await leerPeliculas();
    const nuevaPelicula = {
        id: data.peliculas.length > 0
        ? Math.max(...data.peliculas.map(e => e.id)) + 1
        : 1,
        titulo,
        director,
        año,
        genero,
        calificacion
    }
        if (parseInt(nuevaPelicula.año) < 1900 || parseInt(nuevaPelicula.año) > 2025) {
            return res.status(400).json({error: 'año invalido'})
        }
        const generosValidos = ["Acción", "Comedia", "Drama", "Terror", "Ciencia Ficción"];
        if (!generosValidos.includes(nuevaPelicula.genero)) {
        return res.status(400).json({error: 'Género no válido'});
        }
        if(parseInt(nuevaPelicula.calificacion) > 10 || parseInt(nuevaPelicula.calificacion)< 0) {
            return res.status(400).json({error : 'calificacion no valida'})
        }
        data.peliculas.push(nuevaPelicula);
        await guardarPeliculas(data)
        res.status(201).json(nuevaPelicula)
  } catch(error) {
    res.status(500).json ({ error: 'Error al crear pelicula'})
}
});

app.patch('/peliculas/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const actualizaciones = req.body;
    const data = await leerPeliculas()
    const index = data.peliculas.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({error: 'peli no encontrada'})
    }
    data.peliculas[index] = { ...data.peliculas[index], ...actualizaciones };
    await guardarPeliculas(data);
    res.json(data.peliculas[index]);
  } catch (error) {
    res.status(500).json({error: 'Error al buscar pa'})
  }
});

app.delete('/peliculas/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const data = await leerPeliculas();
    const index = data.peliculas.find(e => e.id === parseInt(id));
    if(index === -1) {
        res.status(400).json({error: 'pelicula no encontrada'})
    }
    const peliculaEliminada = data.peliculas.splice(data.peliculas.splicas(index,1))
    await guardarPeliculas(data)
    res.json({message: 'Pelicula eliminada', pelicula: peliculaEliminada})
    } catch(error) {
        res.status(500).json({error: 'error interno al eliminar'})
    }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});