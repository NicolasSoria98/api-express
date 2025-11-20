const repository = require('../repositories/libroRepository')

const generosValidos = ["Ficción", "No Ficción", "Ciencia", "Historia", "Biografía"];

function validarLibros(libro) {
    if(!libro.titulo || !libro.autor) {
        throw new Error('titulo y autos son obligatorios')
    }
    if(libro.año < 1000 || libro.año > 2025) {
        throw new Error ('años entre 1000 y 2025')
    }
    if(!generosValidos.includes(libro.genero)) {
        throw new Error (`genero debe ser: ${generosValidos.join(', ')}`)
    }
}

async function createLibro(data) {
    const libro = {
        titulo: data.titulo,
        autor: data.autor,
        año: data.año,
        genero: data.genero,
        disponible: true,
        prestamos: 0

    };
    validarLibros(libro);
    const todos = await repository.getAllLibros()
    libro.id = todos.length > 0
        ? Math.max(...todos.map(l => l.id)) +1
        : 1;
    return await repository.createLibro(libro)
}

async function getLibros(filters ={}) {
    let libros = await repository.getAllLibros();
    if (filters.genero) {
        libros = libros.filter(l =>
            l.genero.toLowerCase() === filters.genero.toLowerCase()
        );
    }
    if (filters.disponible !== undefined) {
        const esDisponible = filters.disponible === 'true';
        libros = libros.filter(l => l.disponible === esDisponible);
    }
    if(filters.autor) {
        libros = libros.filter(l =>
            l.autor.toLowerCase().includes(filters.autor.toLowerCase())
        )
    }
    return libros;
}

async function getLibroById(id) {
    const existe = await repository.getLibroById(id);
    if (!existe) {
        throw new Error('Libro no encontrado')
    }
    return libro
}
async function updateLibro(id, updates) {
    const existe = await repository.getLibroById(id)
    if(!existe) {
        throw new Error('Libro no encontrado')
    }
    return await repository.updateLibro(id, updates);
}
async function deleteLibro(id) {
    const eliminado = await repository.deleteLibro(id)
    if(!eliminado) {
        throw new Error('no existe o no se encuentra pa'
        )

    }
    return eliminado
}
async function prestarLibro(id) {
    const libro = await repository.getLibroById(id)
    if(!libro) {
        throw new Error('Libro no encontrado')
    }
    if (!libro.disponible) {
        throw new Error ('Libro no disponible')
    }
    const updates = {
        disponible: false,
        prestamos: libro.prestamos +1
    }
    return await repository.updateLibro(id, updates);
}

async function devolverLibro(id) {
    const libro = await repository.getLibroById(id)
    if(!libro) {
        throw new Error('Libro no encontrado');
    }
    if(libro.disponible) {
        throw new Error('Libro ya disponible');
    }
    const updates = {
        disponible: true
    }
    return await repository.updateLibro(id, updates)
}
module.exports = {
  createLibro,
  getLibros,
  getLibroById,
  updateLibro,
  deleteLibro,
  prestarLibro,
  devolverLibro
}