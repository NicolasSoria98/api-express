const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const filePath = path.join(__dirname, 'data', 'estudiantes.json');

//funciones de persistencia
async function leerEstudiantes() {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch(error) {
            return {estudiantes: []};
    }

}
async function guardarEstudiantes(data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

app.get('/estudiantes', async (req, res) => {
    try {
        const data = await leerEstudiantes();
        res.json(data.estudiantes);
    } catch (error) {
        res.status(500).json({error: 'Error al leer estudiantes'})
    }
});

app.post('/estudiantes', async (req, res) => {
    try {
        const {nombre, carrera} = req.body
        if(!nombre || !carrera) {
            return res.status(400).json({error: 'faltan datos'})
        }
        const data = await leerEstudiantes();
        const nuevoEstudiante =  {
            id: data.estudiantes.length > 0
            ? Math.max(...data.estudiantes.map(e => e.id)) + 1
            :1,
            nombre,
            carrera
        };
        data.estudiantes.push(nuevoEstudiante);
        await guardarEstudiantes(data);
        res.status(201).json(nuevoEstudiante);
        } catch(error) {
            res.status(500).json({ error: 'error al crear el estudiante'})
        }
    });

    app.get('/estudiantes/:id', async (req, res) => {
        try {
            const {id} = req.params;
            const data = await leerEstudiantes();
            const estudiante = data.estudiantes.find(e => e.id === parseInt(id));
            if(!estudiante) {
                return res.status(404).json({error: 'estudante nbo encontrado'})
            }
            res.json(estudiante);
        } catch(error) {
            res.status(500).json({error: 'error al buscar'})
        }
    });

    const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});