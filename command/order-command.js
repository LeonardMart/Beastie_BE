const db = require("../config/db.config");
const services = require("../services/order-service");
const repo = require("../repositories/order-repository");
const bcrypt = require("bcrypt");
const uuid = require("../utils/generate-uuid");
const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const createOrderCommand = async ({
  userId,
  pfId,
  owner_address_id,
  pf_address_id,
  delivery,
  total_price,
  startDate,
  endDate,
  pets,
  total_days,
  daily_price,
  total_hours,
  hourly_price,
  service_price,
  platform_fee,
}) => {
  const commit = async () => {
    const client = await db.connect();
    try {
      await client.query("Begin");
      await repo.createOrder(client)({
        userId,
        pfId,
        startDate,
        endDate,
        owner_address_id,
        pf_address_id,
        total_price,
        delivery,
      });
      const order = await repo.getOrderId(client)({
        userId,
        pfId,
        startDate,
        endDate,
      });
      const { order_id: orderId } = order[0];
      await repo.insertOrderPrice(client)({
        orderId,
        total_days,
        daily_price,
        total_hours,
        hourly_price,
        service_price,
        platform_fee,
      });
      console.log("tes", orderId);
      await services.insertOrderAddresses(client)({
        orderId,
        userId,
        pfId,
        owner_address_id,
        pf_address_id,
      });

      console.log("testes");
      if (pets.length > 0) {
        await Promise.all(
          pets.map(async (pet) => {
            const { id, service } = pet;
            await services.insertPet(client)({ orderId, userId, id });
            if (service.length > 0) {
              service.map(async (item) => {
                console.log("testes3");
                const { task_id, service_name, price, count } = item;
                await repo.insertOrderTasks(client)({
                  orderId,
                  task_id,
                  service_name,
                  id,
                  price,
                  count,
                });
              });
            }
          })
        );
      }

      await repo.updatePfStatusTrue(client)({ pfId });

      await client.query("COMMIT");
      return { status: 1 };
    } catch (error) {
      await client.query("ROLLBACK");
      return { status: 0, message: error };
    } finally {
      client.release();
    }
  };
  return {
    commit,
  };
};

module.exports = createOrderCommand;
