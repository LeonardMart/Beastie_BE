const jwt = require("jsonwebtoken");
const repo = require("../repositories/login-repository");
const uuid = require("../utils/generate-uuid");
const handleAsync = require("../middleware/handle-async");
const apiResponse = require("../utils/api-responses");

const retrieveUser = handleAsync(async (req, res) => {
  console.log(req.params);
  try {
    let data = await repo.retrieveUser(req.params);
    if (data.length > 0) {
      console.log("data", data);
      res.status(200).json(
        apiResponse({
          data,
          message: "Successfully get user",
        })
      );
    } else {
      res.json(
        apiResponse({
          status: 0,
          message: "failed get user",
        })
      );
    }
  } catch (error) {
    console.log("error", error);
  }
});

const retrieveUserByUserId = handleAsync(async (req, res) => {
  console.log(req.params);
  try {
    let data = await repo.retrieveUserByUserId(req.params);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully get user",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

module.exports = {
  retrieveUser,
  retrieveUserByUserId,
};
