const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Busca el token en la petición
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No hay token, autorización denegada.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Confirma que el token es real usando tu clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = decoded.usuario;
        next(); // Permite que el proceso continúe
    } catch (err) {
        res.status(401).json({ message: 'Token no es válido o ya caducó.' });
    }
};
