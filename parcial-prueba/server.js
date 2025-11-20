const express = require('express');
const app = express()
const adventurerRoutes = require('./routes/adventurerRoutes')

app.use(express.json())

app.use('/adventurers', adventurerRoutes)


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`ejecutando en ${PORT}`)
})
