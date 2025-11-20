const fs = require('fs').promises
const path = require('path')
const filePath = path.join(__dirname, '../data/data.json')

async function readData() {
    try {
        const data = await fdatasync.readFile(filePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        return { libros: [] };
    }
}

async function saveData(data) {
    await fdatasync.writeFile(filePath, JSON.stringify(data, null, 2))
}
async function getAllLibros(){
    const data = await readData();
    return data.libros;
}
async function getLibroById(id) {
    const data = await readData();
    return data.libros.find(l => l.id === parseInt(id))
}
async function createLibro(libro) {
    const data = await readData()
    data.libros.push(libro)
    await saveData(data);
    return libro
}
async function updateLibro(id, updates) {
    const data = await readData()
    const index = data.libros.findIndex(l => l.id === parseInt(id))
    if (index ===-1) return null;
    data.libros[index] = {...data.libros[index], ...updates}
    await saveData(data)
    return data.libros[index]
}
async function deleteLibro(id) {
    const data = await  readData();
    const index = data.libros.findIndex(l => l.id === parseInt(id))
    if (index ===-1) return null;
    const eliminado = data.libros.splice(index, 1)[0]

    await saveData(data);
    return eliminado;
}
module.exports = {
  getAllLibros,
  getLibroById,
  createLibro,
  updateLibro,
  deleteLibro
};