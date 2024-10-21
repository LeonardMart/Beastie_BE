const logger = require("../utils/logger");
const getRemoteAddress = require("../utils/get-remote-address");

const logIncomingRequest = (req, res, next) => {
  const remoteAddress = getRemoteAddress(req);
  const method = req.method;
  const url = req.originalUrl;
  const status = res.statusCode;
  const body = method !== "GET" ? JSON.stringify(req.body) : "";

  const message = `${remoteAddress} => ${method} : ${url} ${status} ${body}}`;

  logger.info(message);

  next();
};

module.exports = logIncomingRequest;
