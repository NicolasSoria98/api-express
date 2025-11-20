const express = require('express');
const app = express();

app.use(express.json());

const estudianteRoutes = require('./routes/estudianteRoutes');
app.use('/estudiantes', estudianteRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).json({ error: err.message });
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});