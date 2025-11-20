const repository = require('../repositories/dataRepository');

async function createEstudiante(data) {
  // Validación 1: Datos obligatorios
  if (!data.nombre || !data.carrera) {
    throw new Error('Nombre y carrera son obligatorios');
  }
  
  // Validación 2: Nombre mínimo 3 caracteres
  if (data.nombre.length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres');
  }
  
  // Lógica de negocio: Crear objeto completo
  const estudiante = {
    nombre: data.nombre.trim(),
    carrera: data.carrera.trim(),
    nivel: 1,
    puntos: 0,
    activo: true
  };
  
  // Generar ID único
  const todos = await repository.getAllEstudiantes();
  estudiante.id = todos.length > 0
    ? Math.max(...todos.map(e => e.id)) + 1
    : 1;
  
  // Guardar
  return await repository.createEstudiante(estudiante);
}
async function getEstudiantes(filters = {}) {
  let estudiantes = await repository.getAllEstudiantes();
  
  // Filtro por carrera
  if (filters.carrera) {
    estudiantes = estudiantes.filter(e => 
      e.carrera.toLowerCase() === filters.carrera.toLowerCase()
    );
  }
  
  // Filtro por nombre (búsqueda parcial)
  if (filters.nombre) {
    estudiantes = estudiantes.filter(e => 
      e.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
    );
  }
  
  // Filtro por nivel
  if (filters.nivel) {
    estudiantes = estudiantes.filter(e => e.nivel === parseInt(filters.nivel));
  }
  
  // Filtro por activo
  if (filters.activo !== undefined) {
    const esActivo = filters.activo === 'true';
    estudiantes = estudiantes.filter(e => e.activo === esActivo);
  }
  
  return estudiantes;
}
async function getEstudianteById(id) {
  const estudiante = await repository.getEstudianteById(id);
  
  if (!estudiante) {
    throw new Error('Estudiante no encontrado');
  }
  
  return estudiante;
}
async function updateEstudiante(id, updates) {
  // Verificar que existe
  const existe = await repository.getEstudianteById(id);
  if (!existe) {
    throw new Error('Estudiante no encontrado');
  }
  
  // Validar campos si vienen
  if (updates.nombre && updates.nombre.length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres');
  }
  
  // Actualizar
  return await repository.updateEstudiante(id, updates);
}
async function deleteEstudiante(id) {
  const eliminado = await repository.deleteEstudiante(id);
  
  if (!eliminado) {
    throw new Error('Estudiante no encontrado');
  }
  
  return eliminado;
}
async function subirNivel(id) {
  const estudiante = await repository.getEstudianteById(id);
  
  if (!estudiante) {
    throw new Error('Estudiante no encontrado');
  }
  
  // Lógica: Necesita 100 puntos por nivel
  const puntosNecesarios = estudiante.nivel * 100;
  
  if (estudiante.puntos < puntosNecesarios) {
    throw new Error(`Necesitas ${puntosNecesarios} puntos para subir de nivel`);
  }
  
  // Subir nivel y resetear puntos
  const updates = {
    nivel: estudiante.nivel + 1,
    puntos: estudiante.puntos - puntosNecesarios
  };
  
  return await repository.updateEstudiante(id, updates);
}
