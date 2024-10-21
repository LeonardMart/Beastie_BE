require("dotenv").config()
const jwt = require("jsonwebtoken");
const apiResponse = require("../utils/api-responses");
const logger = require("../utils/logger");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    let token = "";
    if (authHeader) {
      const splitToken = authHeader.split(" ");

      if (splitToken.length > 0) {
        token = authHeader.split(" ")[1];
      }
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
    const user = jwt.verify(token, process.env.JWT_SEC);
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

module.exports = verifyToken;
