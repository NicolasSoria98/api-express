const express = require('express')
const app = express()
app.use(express.json())
const librosRoutes = require('./routes/libroRoutes')

app.use('./libros', libroRoutes)

app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(400).json({error: err.message})
})
const PORT = 3000;
app.listen(PORT, () => {
    console.log('servidro corriendo en puerto 3000')
})