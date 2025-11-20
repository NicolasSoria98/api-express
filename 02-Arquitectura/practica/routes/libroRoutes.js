const express = require('express');
const router = express.Router();
const controller = require('../controllers/libroController.js')

router.get('/', controller.getLibros)
router.get('/:id', controller.getLibrosById)
router.post('/', controller.createLibro)
router.patch('/:id', controller.updateLibro)
router.delete('/:id', controller.deleteLibro)
router.post('/:id/prestar', controller.prestarLibro)
router.post('/:id/devolver', controller.devolverLibro)

module.exports = router;