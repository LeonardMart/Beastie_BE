const db = require("../config/db.config");
const services = require("../services/register-pf-services");
const repo = require("../repositories/register-pf-repository");
const bcrypt = require("bcrypt");
const uuid = require("../utils/generate-uuid");
const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const registerPfCommand = async ({
  userId,
  pfAddressId,
  service,
  priceList,
}) => {
  const commit = async () => {
    const client = await db.connect();
    console.log("masuk");
    try {
      await client.query("Begin");
      if (userId != "" || userId != undefined || userId != null) {
        await repo.updatePfUserFlag(client)({ userId });
        await repo.updatePfAddressFlag(client)({userId, pfAddressId})
        await services.insertService(client)(service);
        await services.insertpriceList(client)(priceList);
        if (priceList.additionalTask.length > 0) {
          await Promise.all(
            priceList.additionalTask.map(async (item) => {
              console.log("item", item)
              await services.insertTask(client)(item);
            })
          );
        }
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

module.exports = registerPfCommand;
