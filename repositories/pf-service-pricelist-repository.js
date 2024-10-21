const db = require("../config/db.config");
const moment = require("moment");

const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const updateService =
  (client) =>
  async ({ userId, accept_dog, accept_cat, accept_other }) => {
    console.log("te", accept_dog, accept_cat, accept_other);
    const sql = `
        update accepted_pet 
        set accept_dog = $1, accept_cat = $2, accept_other = $3
        where user_id = $4
    `;
    const param = [accept_dog, accept_cat, accept_other, userId];
    const result = await client.query(sql, param);
    return result.rows;
  };

const updatePfPrice =
  (client) =>
  async ({ userId, hourly_price, daily_price }) => {
    const sql = `
        update pet_friend
        set price_daily =$1, price_hourly = $2, updated_date = $3
        where user_id = $4
    `;
    const param = [
      daily_price.replace(/\./g, ""),
      hourly_price.replace(/\./g, ""),
      dateNow(),
      userId,
    ];
    const result = await client.query(sql, param);
    return result.rows;
  };

const checkTask =
  (client) =>
  async ({ userId, id }) => {
    const sql = `
        select * from task_service
        where user_id = $1 and task_id = $2
    `;
    const param = [userId, id];
    const result = await client.query(sql, param);
    return result.rows;
  };

const updateTask =
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
    const sql = `
        update task_service
        set service_name = $1, price =$2, accept_dog = $3, accept_cat=$4, accept_other=$5
        where user_id = $6 and task_id = $7
    `;
    const param = [
      service_name,
      price.replace(/\./g, ""),
      accept_dog,
      accept_cat,
      accept_other,
      userId,
      id,
    ];
    const result = await client.query(sql, param);
    return result.rows;
  };

const deleteAllTaskService =
  (client) =>
  async ({ userId }) => {
    const sql = `
      delete from task_service where user_id =$1
    `;
    const param = [userId];
    const result = await client.query(sql, param);
    return result.rows;
  };

const insertTask =
  (client) =>
  async ({
    userId,
    service_name,
    price,
    accept_dog,
    accept_cat,
    accept_other,
  }) => {
    const sql = `
    insert into task_service (service_name, price, user_id, accept_dog, accept_cat, accept_other)
    values($1, $2, $3, $4, $5, $6)
    `;
    const param = [
      service_name,
      price.replace(/\./g, ""),
      userId,
      accept_dog,
      accept_cat,
      accept_other,
    ];
    const result = await client.query(sql, param);
    return result.rows;
  };

const retrieveAddress = async ({ userId }) => {
  console.log("cek", userId);
  const sql = `
      SELECT
          id,
          detail_address as detailAddress,
          label,
          location_lat as latitude,
          location_long as longitude
      from user_address
      where user_id = $1
      `;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};

module.exports = {
  updateService,
  updatePfPrice,
  checkTask,
  updateTask,
  deleteAllTaskService,
  insertTask,
};
