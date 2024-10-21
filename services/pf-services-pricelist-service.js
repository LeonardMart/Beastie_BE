require("dotenv").config();

const repo = require("../repositories/pf-service-pricelist-repository");

const checkTask =
  (client) =>
  async ({ userId, id }) => {
    const data = await repo.checkTask(client)({ userId, id });
    return data;
  };

const updateInsertTask =
  (client) =>
  async ({
    userId,
    id,
    service_name,
    price,
    accept_dog,
    accept_cat,
    accept_other,
  }) => {
    await repo.insertTask(client)({
      userId,
      service_name,
      price,
      accept_dog,
      accept_cat,
      accept_other,
    });
  };

module.exports = { updateInsertTask };
