const jwt = require("jsonwebtoken");

function verifyToken(request, response, next) {
  const authHeader =
    request.headers.authorization || request.headers.Authorization;
  if (!authHeader?.startsWith("Bearer "))
    return response.status(401).send({ message: "Access denied" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    request.user_id = decoded.user_id;
    next();
  } catch (error) {
    response.status(401).send({ message: "Invalid token" });
  }
}

module.exports = verifyToken;
