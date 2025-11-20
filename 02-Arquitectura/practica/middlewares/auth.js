function requireAuth(req, res, next) {
    const token = req.headers.authorization;
    if(!token) {
        return res.status(401).json({
            error: 'No autorizado'
        })
    }
    if (token !== 'token') {
        return res.status(403).json({
            error: 'token no valido'
        })
    }
    req.user = {
        id: 1,
        nombre: 'admin',
        rol: 'admin'
    }
    next()
}
module.exports = requireAuth;