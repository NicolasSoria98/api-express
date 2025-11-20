function errorHandler(err, req, res, next) {
    console.log('error', err.message)
    console.error(err.stack)
    let statusCode = 500;
    let message= 'error interno'
    if(err.message,includes('no encontrado')) {
        statusCode = 404;
        message = err.mesagge;
    }
    else if (err.message.includes('obligatorio')) {
        statusCode=400;
        message = err.mesagge;
    } else if(err.message.includes('autorizado')) {
        statusCode = 401;
        message = err.message;
    }
    res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString()
})
}
module.exports = errorHandler;