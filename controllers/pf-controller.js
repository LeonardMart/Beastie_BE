const jwt = require("jsonwebtoken");
const service = require("../services/pf-order-services");
const repo = require("../repositories/pf-repository");
const uuid = require("../utils/generate-uuid");
const handleAsync = require("../middleware/handle-async");
const apiResponse = require("../utils/api-responses");
const updateInsertServicePricelistCommand = require("../command/pf-service-pricelist-command");

const retrievePfInfo = handleAsync(async (req, res) => {
  console.log(req.params);
  try {
    let data = await repo.retrievePfInfo(req.params);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully get pet friend info",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const updatePfStatus = handleAsync(async (req, res) => {
  console.log(req.body);
  try {
    let data = await repo.updatePfStatus(req.body);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully get pet friend info",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const updateInsertServicePricelist = handleAsync(async (req, res) => {
  const { service, priceList } = req.body;
  const { userId } = service;
  console.log(service, priceList, userId);
  const command = await updateInsertServicePricelistCommand({
    userId,
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
      message: "Success create new post",
    });

    res.json(apiResponse(response)).status(200);
  }
});

const updateSelectedPfAddress = handleAsync(async (req, res) => {
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

const updatePfAddress = handleAsync(async (req, res) => {
  console.log(req.body);
  const { userId, id, address } = req.body;
  const { label, detail_address, latitude, longitude } = address;
  try {
    let data = await repo.updateUserAddress({
      id,
      userId,
      label,
      detail_address,
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

const insertPfAddress = handleAsync(async (req, res) => {
  console.log(req.body);
  const { userId, address } = req.body;
  const { label, detail_address, latitude, longitude } = address;
  console.log("njay", userId, label, detail_address, latitude, longitude);
  try {
    let data = await repo.insertUserAddress({
      userId,
      label,
      detail_address,
      longitude,
      latitude,
    });
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully insert address",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const removePfAddress = handleAsync(async (req, res) => {
  try {
    let data = repo.removePfAddress(req.params);
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

const cancelOrder = handleAsync(async (req, res) => {
  try {
    let data = await service.cancelOrder(req.body);
    repo.cancelOrder(req.body);
    res.status(200).json(
      apiResponse({
        data,
        message: "order cancelled by pet friend",
      })
    );
  } catch (error) {}
});

const confirmOrder = handleAsync(async (req, res) => {
  try {
    let data = await repo.confirmOrder(req.body);
    res.status(200).json(
      apiResponse({
        data,
        message: "order confirmed",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const petReceived = handleAsync(async (req, res) => {
  try {
    let data = await repo.petReceived(req.body);
    res.status(200).json(
      apiResponse({
        data,
        message: "order confirmed",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const finishPetCare = handleAsync(async (req, res) => {
  try {
    let data = await repo.finishPetCare(req.body);
    res.status(200).json(
      apiResponse({
        data,
        message: "order confirmed",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const finishOrder = handleAsync(async (req, res) => {
  try {
    let data = await repo.finishOrder(req.body);
    res.status(200).json(
      apiResponse({
        data,
        message: "order confirmed",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const getReview = handleAsync(async (req, res) => {
  try {
    let data = await repo.getReview(req.params);
    if (data.length > 0) {
      res.status(200).json(
        apiResponse({
          data,
          message: "order confirmed",
        })
      );
    } else {
      res.json(
        apiResponse({
          status: 0,
          message: "no review yet",
        })
      );
    }
  } catch (error) {
    console.log("error", error);
  }
});

module.exports = {
  retrievePfInfo,
  updatePfStatus,
  updateInsertServicePricelist,
  updateSelectedPfAddress,
  updatePfAddress,
  insertPfAddress,
  removePfAddress,
  cancelOrder,
  confirmOrder,
  petReceived,
  finishPetCare,
  finishOrder,
  getReview,
};
