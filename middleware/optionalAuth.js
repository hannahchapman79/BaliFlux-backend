const jwt = require('jsonwebtoken');

function optionalAuth(request, response, next) {
    const authHeader = request.headers.authorization || request.headers.Authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
        request.isGuest = true;
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        request.userId = decoded.userId;
        request.isGuest = false;
        next();
    } catch (error) {
        request.isGuest = true;
        next();
    }
}

module.exports = optionalAuth;