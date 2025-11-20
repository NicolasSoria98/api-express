const express = require('express');
const app = express();

app.use(express.json());

app.get('/hola', (req, res) => {
    res.json({message: 'Hola mundo'})
})
const PORT = 8080;
app.listen(PORT, ()=> {
    console.log('servidor corriendo en localhost:8080')
})

let estudiantes = [
  { id: 1, nombre: 'Ana', carrera: 'Sistemas' },
  { id: 2, nombre: 'Luis', carrera: 'Electrónica' },
  { id: 3, nombre: 'María', carrera: 'Sistemas' }
];

app.get ('/estudiantes/', (req, res) => {
    res.json(estudiantes)
    }
)

app.get('/estudiantes/:id' ,(req, res) => {
    const {id} = req.params;
    const estudiante = estudiantes.find (e => e.id === parseInt(id))
    if(!estudiante) {
        return res.statusCode(404).json({ error: 'Estudiante no encontrado'});
    }
    res.json(estudiante)
})

app.get('/estudiantes/buscar/carrera', (req, res) => {
    const {carrera} = req.query;
    if (!carrera) {
        return res.status(400).json({error: 'debes proporcionar una carrera'});
    }
    const resultado = estudiantes.filter (e => 
        e.carrera.toLowerCase() === carrera.toLowerCase()
    );
    res.json(resultado)
})

app.post('/estudiantes', (req, res) => {
    const {nombre, carrera} = req.body;
    if(!nombre || !carrera) {
        return res.status(400).json({ error: 'faltan datos requeridos'});
    }
    const nuevoEstudiante = {
        id: estudiantes.length +1,
        nombre,
        carrera
    };
    estudiantes.push(nuevoEstudiante)

    res.status(201).json(nuevoEstudiante)
})

app.patch('/estudiantes/:id', (req, res) => {
    const {id} = req.params;
    const {nombre, carrera} = req.body
    const estudiante = estudiantes.find(e => e.id ===parseInt(id));
    if (!estudiante) {
        return res.status(404).json({ error: 'estudiante no encontrado'})
    }
    if(nombre) {
        estudiante.nombre = nombre;
    }
    if(carrera) {
        estudiante.carrera = carrera;
    }
    res.json(estudiante);
});





