const express = require('express');
const router = express.Router();
const controller = require('../controllers/libroController.js')
const requireAuth = require('../middlewares/auth');
router.get('/', controller.getLibros)
router.get('/:id', controller.getLibroById)
router.post('/', requireAuth, controller.createLibro)
router.patch('/:id', controller.updateLibro)
router.delete('/:id', requireAuth, controller.deleteLibro)
router.post('/:id/prestar', controller.prestarLibro)
router.post('/:id/devolver', controller.devolverLibro)

module.exports = router;