const jwt = require("jsonwebtoken");
const repo = require("../repositories/address-repository");
const service = require("../services/address-service");
const uuid = require("../utils/generate-uuid");
const handleAsync = require("../middleware/handle-async");
const apiResponse = require("../utils/api-responses");

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

const addAddress = handleAsync(async (req, res) => {
  console.log(req.body);
  try {
    let data = await repo.insertAddress(req.body);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully add address",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const retrieveAddress = handleAsync(async (req, res) => {
  try {
    let data = await service.retrieveAddress(req.params);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully retrieve address",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const updateUserAddress = handleAsync(async (req, res) => {
  console.log(req.body);
  const { userId, id, address } = req.body;
  const { label, detailAddress, latitude, longitude } = address;
  try {
    let data = await repo.updateUserAddress({
      id,
      userId,
      label,
      detailAddress,
      longitude,
      latitude,
    });
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully update selected address",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const removeAddress = handleAsync(async (req, res) => {
  try {
    let data = await repo.removeAddress(req.params);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully remove address",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const updateSelectedAddress = handleAsync(async (req, res) => {
  try {
    await repo.updateAddressFalse(req.body);
    let data = await repo.updateAddressTrue(req.body);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully update selected address",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

module.exports = {
  addAddress,
  retrieveAddress,
  removeAddress,
  updateSelectedAddress,
  updateUserAddress
};
