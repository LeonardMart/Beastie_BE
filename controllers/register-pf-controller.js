const jwt = require("jsonwebtoken");
const repo = require("../repositories/register-pf-repository");
const uuid = require("../utils/generate-uuid");
const handleAsync = require("../middleware/handle-async");
const apiResponse = require("../utils/api-responses");
const registerUserCommand = require("../command/register-user-command");
const registerPfCommand = require("../command/register-pf-command");
const createUser = handleAsync(async (req, res) => {
  const { email, name, phoneNum, password, location, pets } = req.body;
  // var file = req.file;
  console.log("dapet apa nih", req.body);
  const command = await registerUserCommand({
    email,
    name,
    phoneNum,
    password,
    location,
    pets,
  });
  const result = await command.commit();
  console.log(
    "RESULT => IF RESULT = 1 THEN SUCCESS, RESULT = ",
    result.status,
    result.message
  );
  if (result.status > 0) {
    const response = apiResponse({
      data: req.body,
      message: "Success create new post",
    });

    res.json(apiResponse(response)).status(200);
  }
});

const registerPf = handleAsync(async (req, res) => {
  const { userId, pfAddressId, service, priceList } = req.body;
  // // var file = req.file;
  console.log("dapet apa nih", req.body);
  const command = await registerPfCommand({
    userId,
    pfAddressId,
    service,
    priceList,
  });
  const result = await command.commit();
  console.log(
    "RESULT => IF RESULT = 1 THEN SUCCESS, RESULT = ",
    result.status,
    result.message
  );
  if (result.status > 0) {
    const response = apiResponse({
      data: req.body,
      message: "Success register pf",
    });

    res.json(apiResponse(response)).status(200);
  }
});

const retrieveUserById = handleAsync(async(req,res)=>{
  const {userId} = req.params
  try {
    let data = await repo.retrieveUserById({userId});
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully get user",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
})

module.exports = {
  createUser,
  registerPf,
  retrieveUserById
};
