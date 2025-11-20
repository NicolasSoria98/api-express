const estudianteService = require('../services/estudianteService');

async function createEstudiante(req, res, next) {
  try {
    const estudiante = await estudianteService.createEstudiante(req.body);
    res.status(201).json(estudiante);
  } catch (error) {
    next(error);
  }
}

async function getEstudiantes(req, res, next) {
  try {
    const filters = req.query;
    const estudiantes = await estudianteService.getEstudiantes(filters);
    res.json(estudiantes);
  } catch (error) {
    next(error);
  }
}

async function getEstudianteById(req, res, next) {
  try {
    const { id } = req.params;
    const estudiante = await estudianteService.getEstudianteById(id);
    res.json(estudiante);
  } catch (error) {
    next(error);
  }
}

async function updateEstudiante(req, res, next) {
  try {
    const { id } = req.params;
    const estudiante = await estudianteService.updateEstudiante(id, req.body);
    res.json(estudiante);
  } catch (error) {
    next(error);
  }
}
async function deleteEstudiante(req, res, next) {
  try {
    const { id } = req.params;
    const eliminado = await estudianteService.deleteEstudiante(id);
    res.json({ 
      mensaje: 'Estudiante eliminado', 
      estudiante: eliminado 
    });
  } catch (error) {
    next(error);
  }
}
async function subirNivel(req, res, next) {
  try {
    const { id } = req.params;
    const estudiante = await estudianteService.subirNivel(id);
    res.json(estudiante);
  } catch (error) {
    next(error);
  }
}
module.exports = {
  createEstudiante,
  getEstudiantes,
  getEstudianteById,
  updateEstudiante,
  deleteEstudiante,
  subirNivel
};