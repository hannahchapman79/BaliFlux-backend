const jwt = require('jsonwebtoken');
const db = require("../db/connection")

function verifyToken(request, response, next) {
    const token = request.header('authorization');
    if (!token) return response.status(401).send({ message: "Access denied" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.userId = decoded.userId;
        next();
    } catch (error) {
        response.status(401).send({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;