const fs = require('fs').promises;
const { read } = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../data/academy.json')

async function readData() {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
}
async function saveData() {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}
async function getAllAdventurers() {
    data = await readData()
    return data.adventurers
}
async function getAdveturerById(id) {
    const data = await readData()
    return data.adventurers.find(a => a.id === parseInt(id))
}
async function createAdventurer(adventurer) {
    const data = await readData()
    data.adventurers.push(adventurer)
    await saveData(data)
    return adventurer
}
async function updateAdventurer(id, updates){
    const data = await readData()
    const index = data.adventurers.findIndex(a => a.id === parseInt(id))
    if (index === -1){
        return null
    }
    data.adventurers[index] = {...data.adventurers[index], ...updates}
    await saveData(data)
    return data.adventurers[index]
}

module.exports = {
    getAllAdventurers,
    getAdveturerById,
    createAdventurer,
    updateAdventurer
}