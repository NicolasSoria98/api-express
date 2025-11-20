const logger = require('./middlewares/logger');
const timer = require('./middlewares/timer')
const errorHandler = require('./middlewares/errorHandler');
const express = require('express')
const app = express()
app.use(express.json())
app.use(logger);
app.use(timer);
const libroRoutes = require('./routes/libroRoutes')

app.use('/libros', libroRoutes)
app.use(errorHandler);
const PORT = 3000;
app.listen(PORT, () => {
    console.log('servidro corriendo en puerto 3000')
})
