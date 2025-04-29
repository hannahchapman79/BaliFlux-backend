const endpoints = require("../endpoints.json");

exports.getEndpoints = (request, response, next) => {
  response.status(200).send({ endpoints });
};
