const jwt = require("jsonwebtoken");
const repo = require("../repositories/pet-repository");
const uuid = require("../utils/generate-uuid");
const handleAsync = require("../middleware/handle-async");
const apiResponse = require("../utils/api-responses");

// const retrieveUser = handleAsync(async (req, res) => {
//   console.log(req.params);
//   try {
//     let data = await repo.retrieveUser(req.params);
//     res.status(200).json(
//       apiResponse({
//         data,
//         message: "Successfully get user",
//       })
//     );
//   } catch (error) {
//     console.log("error", error);
//   }
// });

const addPet = handleAsync(async (req, res) => {
  console.log(req.body.newPet);
  try {
    let data = await repo.insertPet(req.body.newPet);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully add pet",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const retrievePet = handleAsync(async (req, res) => {
  console.log(req.params);
  try {
    let data = await repo.retrievePet(req.params);
    console.log(data, "tes");
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully retrieve pet",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const removePet = handleAsync(async (req, res) => {
  try {
    let data = await repo.removePet(req.params);
    console.log(data, "tes");
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully remove pet",
      })
    );
  } catch (error) {}
});

module.exports = {
  addPet,
  retrievePet,
  removePet,
};
