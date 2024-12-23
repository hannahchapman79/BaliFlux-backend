const jwt = require('jsonwebtoken');
const db = require("../db/connection")

function verifyToken(request, response, next) {
    const authHeader = request.headers.authorization || request.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return response.status(401).send({ message: "Access denied" });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.userId = decoded.userId;
        next();
    } catch (error) {
        response.status(401).send({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;