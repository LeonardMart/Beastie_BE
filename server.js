const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const logger = require("./utils/logger");
const app = require("./routes/app");
const repo = require("./repositories/order-repository");

const cron = require("node-cron");

const updateOrderStatus = async () => {
  try {
    const currTime = new Date();
    const orders = await repo.getAllActiveOrder();
    console.log("tes", orders);
    

    orders.forEach(async (order) => {
      const endDate = new Date(order.end_date);
      const orderId = order.order_id
      if (endDate <= currTime) {
        const userId = order.pet_friend_id;
        await repo.updatePfStatus({ userId });
      } else if (order.is_finish_pf) {
        const userId = order.pet_friend_id;
        if(!order.is_finish_owner){
          await repo.updatePfStatus({ userId });
        }
        await repo.updatePfStatus({ userId });
      }else if(endDate<= currTime && !order.is_finish_owner){
        await repo.finishOrder({orderId})
        await repo.updatePfStatus({ userId });
      }
    });
    console.log("Order status updated successfully");
  } catch (error) {
    console.error("Error updating pet friend status:", error);
  }
};

cron.schedule("*/10 * * * * *", updateOrderStatus);

global.__basedir = __dirname;

dotenv.config();

const port = process.env.PORT || 8001;

const db = require("./config/db.config");

const server = http.createServer(app);

app.use(cors({ origin: true, credentials: true }));
server.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});
