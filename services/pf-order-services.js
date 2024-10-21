require("dotenv").config();
const haversine = require("haversine");
const repo = require("../repositories/pf-repository");
const moment = require("moment");

const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const truncateToOneDecimal = (num) => {
  return Math.floor(num * 10) / 10;
};

const cancelOrder = async ({ userId, orderId }) => {
  await repo.updateIsOrder({ userId });
  await repo.cancelOrder({ orderId });
};

module.exports = { cancelOrder };
