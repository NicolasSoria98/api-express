const adventurerService = require('../services/adventurerService')

async function createAdventurer(req, res, next) {
    try {
        const adventurer = await adventurerService.createAdventurer(req.body)
        res.status(201).json(adventurer)
    } catch (error){
        next(error)
    }
}
async function getAdventurers(req, res, next) {
    try {
        const adventurers = await adventurerService.getAdventurers(req.query)
        res.json(adventurers)
    
    } catch (error) {
        next(error)
    }
}
async function updateStamina(req, res, next) {
    try {
        const {id} = req.params;
        const {amount} =req.body;
        const adventurer = await adventurerService.updateStamina(id, amount)
        return res.json(adventurer)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createAdventurer,
    getAdventurers,
    updateStamina
}
