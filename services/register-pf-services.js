require("dotenv").config();

const repo = require("../repositories/register-pf-repository");

const checkUser = async (email) => {
  const result = await repo.getUserByEmail(email);
  return result;
};

const insertLocation = async ({ location }) => {
  if (location.length > 0) {
    const insertQuery = location.map((loc) => {
      const result = `${loc.latitude}`;
      return result;
    });
  }
};

const insertService =
  (client) =>
  async ({ userId, acceptDog, acceptCat, acceptOther }) => {
    await repo.insertService(client)({
      userId,
      acceptDog,
      acceptCat,
      acceptOther,
    });
  };

const insertpriceList =
  (client) =>
  async ({ userId, hourlyPrice, dailyPrice, additionalTask }) => {
    console.log("dapet gk?", userId, hourlyPrice, dailyPrice, additionalTask)
    await repo.insertPriceList(client)({ userId, hourlyPrice, dailyPrice, additionalTask })
  };

const insertTask = (client) => async({userId, taskService, price, acceptDog, acceptCat, acceptOther})=>{
    console.log("dapet?", userId, taskService, price, acceptDog, acceptCat, acceptOther)
    await repo.insertTaskService(client)({userId, taskService, price, acceptDog, acceptCat, acceptOther})
}

module.exports = {
  checkUser,
  insertLocation,
  insertService,
  insertpriceList,
  insertTask
};
