const repository = require('../repository/adventurerRepository')

async function createAdventurer(data) {
    if(!data.name) {
        throw new Error('es requerido el nombre')
    }
    if(!data.skills || !Array.isArray(data.skills)){
        throw new Error('debe tener skills y debe ser array')
    }
    const todos= await repository.getAllAdventurers();
    const id = todos.length > 0
    ? Math.max(...todos.map(a => a.id)) + 1
    : 1
    const adventurer = {
        id,
        name: data.name,
        level: 1,
        experience: 0,
        stamina: 100,
        skills: data.skills
    }
    return await repository.createAdventurer(adventurer)
}

async function getAdventurers(filters ={}) {
    let adventurers = await repository.getAllAdventurers();
    if(filters.skill) {
        adventurers = adventurers.filter(a =>
            a.skills.includes(filters.skill)
        )
    }
    if(filters.minLevel) {
        adventurers = adventurers.filter(a => a.level >= parseInt(filters.minLevel))
    }
    return adventurers;
}

async function updateStamina(id, amount) {
    const adventurer = await repository.getAdveturerById(id)
    if(!adventurer) {
        throw new Error('no se encontro')
    }
    adventurer.stamina = adventurer.stamina + amount;
    if(adventurer.stamina < 0){
        adventurer.stamina = 0
    }
    return await repository.updateAdventurer(id, adventurer)
}

module.exports = {
    createAdventurer,
    getAdventurers,
    updateStamina
}