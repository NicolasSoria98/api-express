const express = require('express');
const app = express()
const adventurerRoutes = require('./routes/adventurerRoutes')

try {
    const adventurerRoutes = require('./routes/adventurerRoutes')
    
    app.use(express.json())
    app.use('/adventurers', adventurerRoutes)
    
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`ejecutando en ${PORT}`)
    })
} catch (error) {
    console.error('ERROR AL INICIAR:', error.message)
    console.error(error.stack)
}