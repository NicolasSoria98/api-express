const express = require('express');
const router = express.Router();
const controller = require('../controllers/estudianteController');

router.get('/', controller.getEstudiantes);
router.get('/:id', controller.getEstudianteById);
router.post('/', controller.createEstudiante);
router.patch('/:id', controller.updateEstudiante);
router.delete('/:id', controller.deleteEstudiante);
router.post('/:id/subir-nivel', controller.subirNivel);

module.exports = router;