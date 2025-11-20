const Joi = require('joi');
const generosValidos = ['Ficcion', 'No ficcion', 'Ciencia', 'Historia', 'Biografia'];
const createLibroSchema = Joi.object({
    titulo: Joi.string()
        .min(1)
        .max(200)
        .required()
        .messages({
            'string.empty':'el titulo no puede estar vacio',
            'string.min': 'el titulo debe tener 1 caracter al menos',
            'string.max': 'el titulo no puede tener mas de 200 caracteres',
            'any.required': 'el titulos es obligatorio'
        }),
    autor: Joi.string()
        .min(1)
        .max(200)
        .required()
        .messages({
            'string.empty': 'el autor no puede estar vacio',
            'any.required': 'el autor es oblicatorio'
        }),
    año: Joi.number()
        .integer()
        .min(1000)
        .max(2025)
        .required()
        .messages({
            'number.base': 'el año debe ser numero',
            'number.min': 'debe ser de 1000 en adelante',
            'number.max': 'el año debe ser menor a 2025',
            'any.required': 'el año es obligatorio'
        }),
    genero: Joi.string()
        .valid(...generosValidos)
        .required()
        .messages({
            'any.only': `el genero debe ser uno de: ${generosValidos.join(', ')}`,
            'any.required': 'el genero es obligatorio'
        }),
    disponible: Joi.forbidden(),
    prestamos: Joi.forbidden(),
    id: Joi.forbidden()
});
const updateLibroSchema = Joi.object({
    titulo: Joi.string().min(1).max(200),
    autor: Joi.string().min(1).max(100),
    año: Joi.number().integer().min(1000).max(2025),
    genero: Joi.string().valid(...generosValidos),
    disponible: Joi.boolean(),
    prestamos: Joi.number().integer().min(0)
}).min(1)
const filterLibrosSchema = Joi.object({
    genero: Joi.string().valid(...generosValidos),
    autor: Joi.string(),
    disponible: Joi.string().valid('true', 'false')
})
module.exports = {
    createLibroSchema,
    updateLibroSchema,
    filterLibrosSchema
};