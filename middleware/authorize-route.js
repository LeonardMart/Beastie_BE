require("dotenv").config();

const jwt = require("jsonwebtoken");
const apiResponse = require("../utils/api-response");
const logger = require('../utils/logger');
const authorize = (req, res, next) => {
  try {
    const header = req.header("Authorization");
    let token = "";

    if (header) {
      const split = header.split(" ")

      if (split.length > 0)
        token = header.split(" ")[1];
    }
    if (!header || !token) {
      return res.status(401).json(
        apiResponse({
          status: 0,
          message: "You are not authorize.",
          errors: ["header/token is empty"],
          statusCode: 401,
        })
      );
    }
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (error) {
    logger.error(error.message);
    const errors = [error];
    return res.status(401).json(
      apiResponse({
        status: 0,
        message: "You are not authorize.",
        errors: errors,
        statusCode: 401,
      })
    );
  }
};

module.exports = authorize;
