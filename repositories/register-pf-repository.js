const db = require("../config/db.config");
const moment = require("moment");

const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const updatePfUserFlag =
  (client) =>
  async ({ userId }) => {
    const sql = `
        update user_list set pf_flag = true
        where user_id = $1
    `;
    const param = [userId];
    const result = await client.query(sql, param);
    return result.rows;
  };

const updatePfAddressFlag =
  (client) =>
  async ({ userId, pfAddressId }) => {
    const sql = `
        update user_address set is_pet_friend = true
        where user_id = $1 and id = $2
    `;
    const param = [userId, pfAddressId];
    const result = await client.query(sql, param);
    return result.rows;
  };

const insertService =
  (client) =>
  async ({ userId, acceptDog, acceptCat, acceptOther }) => {
    const sql = `
        insert into accepted_pet(user_id, accept_dog, accept_cat, accept_other)
        values ($1, $2, $3, $4)
    `;
    const param = [userId, acceptDog, acceptCat, acceptOther];
    const result = await client.query(sql, param);
    return result.rows;
  };

const insertPriceList =
  (client) =>
  async ({ userId, hourlyPrice, dailyPrice }) => {
    const sql = `
        insert into pet_friend (user_id, "desc", price_daily, price_hourly, created_date, updated_date, is_active)
        values($1, $2, $3, $4, $5, $6, $7)
    `;
    const param = [
      userId,
      "Hello, i am available!",
      dailyPrice.replace(/\./g, ""),
      hourlyPrice.replace(/\./g, ""),
      dateNow(),
      dateNow(),
      false,
    ];
    const result = await client.query(sql, param);
    return result.rows;
  };



const insertTaskService =
  (client) =>
  async ({ userId, taskService, price, acceptDog, acceptCat, acceptOther }) => {
    const sql = `
        insert into task_service (service_name, price, user_id, accept_dog, accept_cat, accept_other)
        values($1, $2, $3, $4, $5, $6)
    `;
    const param = [
      taskService,
      price,
      userId,
      acceptDog,
      acceptCat,
      acceptOther,
    ];
    const result = await client.query(sql, param);
    return result.rows;
  };

const retrieveUserById = async ({ userId }) => {
  const sql = `
    SELECT  
    ul.user_id as userId,
    ul.username,
    ul.email,
    ul.phone_num as phone,
    ad.userAddress,
    pl.pets,
    ul.pf_flag
    FROM USER_LIST ul
    LEFT JOIN (
    SELECT 
        user_id,
        json_agg(json_build_object(
            'id', id,
            'label', label,
            'detailAddress', detail_address,
            'latitude', location_lat,
            'longitude', location_long
        )) as userAddress
    FROM user_address
    GROUP BY user_id
    ) ad ON ul.user_id = ad.user_id
    LEFT JOIN (
    SELECT 
        user_id,
        json_agg(json_build_object(
            'id', pet_id,
            'name', name,
            'gender', gender,
            'dob', birth_date,
            'breed', breed,
            'type', pt.type_name
        )) as pets
    FROM pet_list pl
    LEFT JOIN pet_type pt ON pl.type = pt.type_id
    GROUP BY user_id
    ) pl ON ul.user_id = pl.user_id
    WHERE ul.user_id = $1; `;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};


module.exports = {
  updatePfUserFlag,
  updatePfAddressFlag,
  insertService,
  insertPriceList,
  insertTaskService,
  retrieveUserById
};
