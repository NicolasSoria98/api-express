const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, '../data/data.json');

async function readData() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { estudiantes: [] };
  }
}

async function saveData(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function getAllEstudiantes() {
  const data = await readData();
  return data.estudiantes;
}

async function getEstudianteById(id) {
  const data = await readData();
  return data.estudiantes.find(e => e.id === parseInt(id));
}
async function createEstudiante(estudiante) {
  const data = await readData();
  data.estudiantes.push(estudiante);
  await saveData(data);
  return estudiante;
}

async function updateEstudiante(id, updates) {
  const data = await readData();
  const index = data.estudiantes.findIndex(e => e.id === parseInt(id));
  
  if (index === -1) return null;
  
  data.estudiantes[index] = { ...data.estudiantes[index], ...updates };
  await saveData(data);
  return data.estudiantes[index];
}

async function deleteEstudiante(id) {
  const data = await readData();
  const index = data.estudiantes.findIndex(e => e.id === parseInt(id));
  
  if (index === -1) return null;
  
  const eliminado = data.estudiantes.splice(index, 1)[0];
  await saveData(data);
  return eliminado;
}
module.exports = {
  getAllEstudiantes,
  getEstudianteById,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante
};