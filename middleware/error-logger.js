const logger = require("../utils/logger");
const apiResponse = require("../utils/api-responses");

module.exports = (err, req, res, next) => {
  logger.error(err);

  const statusCode = res.statusCode || 500;

  res.status(statusCode).json(
    apiResponse({
      status: 0,
      statusCode: res.statusCode,
      message:
        "Oops something went wrong and we are working to fix the problem! We'll be up and running shortly.",
      errors: [err.message],
    })
  );
};
