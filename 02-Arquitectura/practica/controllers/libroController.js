const libroService = require('../services/libroService.js')

async function createLibro(req, res, next) {
    try{
        const libro = await libroService.createLibro(req.body)
        res.status(201).json(libro)
    } catch (error) {
        next(error)
    }
}

async function getLibros(req, res, next) {
    try {
        const filters = req.query;
        const libros = await libroService.getLibros(filters)
        res.json(libros)
        
    } catch (error) {
        next(error)
    }
}
async function getLibrosById (req, res, next) {
    try {
        const {id} = req.params;
        const libro = await librosService.getLibrosById(id);
        res.json(libro)
    } catch (error) {
        next(error)
    }
}

async function updateLibro (req, res, next) { 
    try {
        const {id} = req.params;
        const libro = await libroService.updateLibro(id, req.body)
        res.json(libro)
    } catch (error) {
        next(error)
    }
}
async function deleteLibro(req, res, next) {
    try {
        const {id} = req.params
        const eliminado = await libroService.deleteEstudiante(id)
        res.json({
            mensaje: 'libro eliminado',
            libro: eliminado
        })
    } catch (error) {
        next(error)
    }
}

async function prestarLibro(req, res, next) {
    try {
        const libro = await libroService.prestarLibro(req.params.id)
        res.json(libro)
    } catch (error) {
        next(error)
    }
}
async function devolverLibro(req, res, next) {
    try {
        const libro = await libroController.devolverLibro(req.params.id)
        res.json(libro)
    } catch (error) {
        next(error)
    }
}

module.exports =  {
    createLibro,
    getLibros,
    getLibrosById,
    updateLibro,
    deleteLibro,
    prestarLibro,
    devolverLibro
}
