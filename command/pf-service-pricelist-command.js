const db = require("../config/db.config");
const services = require("../services/pf-services-pricelist-service");
const repo = require("../repositories/pf-service-pricelist-repository");
const bcrypt = require("bcrypt");
const uuid = require("../utils/generate-uuid");
const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const updateInsertServicePricelistCommand = async ({
  userId,
  service,
  priceList,
}) => {
  const commit = async () => {
    const client = await db.connect();
    try {
      await client.query("Begin");
      const { additionalTask } = priceList;
      await repo.updateService(client)(service);
      await repo.updatePfPrice(client)(priceList);
      if (additionalTask.length > 0) {
        await repo.deleteAllTaskService(client)({ userId });
        await Promise.all(
          additionalTask.map(async (item) => {
            const {
              id,
              service_name,
              price,
              accept_dog,
              accept_cat,
              accept_other,
            } = item;
            await services.updateInsertTask(client)({
              userId,
              id,
              service_name,
              price,
              accept_dog,
              accept_cat,
              accept_other,
            });
          })
        );
      }
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

module.exports = updateInsertServicePricelistCommand;
