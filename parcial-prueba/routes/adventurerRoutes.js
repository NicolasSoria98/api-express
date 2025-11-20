const express = require('express');
const router = express.Router();
const controller = require('../controllers/adventurerController');


router.post('/', controller.createAdventurer)
router.get('/', controller.getAdventurers)
router.patch('/:id/stamina', controller.updateStamina)

module.exports = router;