const jwt = require("jsonwebtoken");
const repo = require("../repositories/login-repository");
const repoOrder = require("../repositories/order-repository");
const uuid = require("../utils/generate-uuid");
const handleAsync = require("../middleware/handle-async");
const apiResponse = require("../utils/api-responses");
const service = require("../services/order-service");
const orderCommand = require("../command/order-command");

const retrieveUser = handleAsync(async (req, res) => {
  console.log(req.params);
  try {
    let data = await repo.retrieveUser(req.params);
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

const getPf = handleAsync(async (req, res) => {
  console.log(req.params);
  try {
    // const {userId, }
    let data = await service.getPf(req.body);
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

const getPfbyId = handleAsync(async (req, res) => {
  console.log(req.params);
  try {
    // const {userId, }
    let data = await service.getPfById(req.params);
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

const getPfTaskService = handleAsync(async (req, res) => {
  try {
    let data = await service.getPfTaskService(req.params);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully get service",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const getAllPfTaskService = handleAsync(async (req, res) => {
  try {
    let data = await repoOrder.getAllPfTaskService(req.params);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully get service",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const createOrder = handleAsync(async (req, res) => {
  const { booking, price } = req.body;
  console.log("dapat", booking);
  try {
    const {
      userId,
      pfId,
      owner_address_id,
      pf_address_id,
      pets,
      delivery,
      total_price,
      startDate,
      endDate,
    } = booking;
    const {
      total_days,
      daily_price,
      total_hours,
      hourly_price,
      service_price,
      platform_fee,
    } = price;
    const command = await orderCommand({
      userId,
      pfId,
      owner_address_id,
      pf_address_id,
      pets,
      delivery,
      total_price,
      startDate,
      endDate,
      total_days,
      daily_price,
      total_hours,
      hourly_price,
      service_price,
      platform_fee,
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
        message: "Success create new order",
      });

      res.json(apiResponse(response)).status(200);
    }
  } catch (error) {
    console.log("error", error);
  }
});

const createReview = handleAsync(async (req, res) => {
  try {
    console.log("tes", req.body);
    const { pfId, userId, review, orderId } = req.body;
    const { rating, description } = review;
    const data = await repoOrder.insertReview({
      pfId,
      userId,
      rating,
      description,
      orderId,
    });
    if (data) {
      res.status(200).json(
        apiResponse({
          data,
          message: "Successfully create review",
        })
      );
    } else {
      res.json(
        apiResponse({
          data,
          status: 0,
          message: "failed create review",
        })
      );
    }
  } catch (error) {}
});

const getOwnerOrder = handleAsync(async (req, res) => {
  try {
    console.log("param", req.params);
    const data = await service.getOwnerOrderList(req.params);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully get service",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const getPfOrder = handleAsync(async (req, res) => {
  try {
    const data = await service.getPfOrderList(req.params);
    res.status(200).json(
      apiResponse({
        data,
        message: "Successfully get service",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const finishOrder = handleAsync(async (req, res) => {
  try {
    const data = await repoOrder.finishOrder(req.body);
    await repoOrder.updatePfStatus(req.body);
    res.status(200).json(
      apiResponse({
        data,
        message: "order finished",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});

const bookmarkPf = handleAsync(async (req, res) => {
  try {
    console.log(req.body);
    const { bookmarked } = req.body;
    if (!bookmarked) {
      const data = await repoOrder.bookmarkPf(req.body);
      res.status(200).json(
        apiResponse({
          data,
          message: "pf bookmarked",
        })
      );
    } else {
      const data = await repoOrder.removeBookmark(req.body);
      res.status(200).json(
        apiResponse({
          data,
          message: "pf bookmarked",
        })
      );
    }
  } catch (error) {
    console.log("error", error);
  }
});

const getBookmarkPf = handleAsync(async (req, res) => {
  try {
    console.log(req.body);
    const data = await repoOrder.getBookmarkPf(req.body)
    console.log("data data",data);
    res.status(200).json(
      apiResponse({
        data,
        message: "bookmark list",
      })
    );
  } catch (error) {
    console.log("error", error);
  }
});
module.exports = {
  retrieveUser,
  getPf,
  getPfbyId,
  getPfTaskService,
  getAllPfTaskService,
  createOrder,
  createReview,
  getOwnerOrder,
  getPfOrder,
  finishOrder,
  bookmarkPf,
  getBookmarkPf,
};
