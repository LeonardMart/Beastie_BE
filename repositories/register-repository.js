const db = require("../config/db.config");
const moment = require("moment");

const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const getUserByEmail = async (email) => {
  const sql = `SELECT * FROM user_list WHERE email = $1`;
  const param = [email];
  const result = await db.query(sql, param);
  return result.rowCount;
};

const insertUser =
  (client) => async (userId, email, username, phone, password) => {
    console.log("cek", userId, email, username, password, phone);
    const sql = `INSERT INTO user_list(user_id, email, username, password, phone_num, created_date, updated_date, pf_flag) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    const param = [
      userId,
      email,
      username,
      password,
      phone,
      dateNow(),
      dateNow(),
      false,
    ];
    const result = await client.query(sql, param);
    return result.rows;
  };

const insertUserAddress =
  (client) => async (userId, label, detailAddress, latitude, longitude) => {
    console.log("fuck", userId, label, detailAddress, latitude, longitude);
    const sql = `INSERT INTO user_address (user_id, label, detail_address, location_lat, location_long, created_date, updated_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    console.log("tes 2")
    const param = [userId, label, detailAddress, latitude, longitude, dateNow(), dateNow()];
    console.log("tes 3")
    const result = await client.query(sql, param);
    console.log("tes 4")
    return result.rows;
  };

const insertPetList =
  (client) => async (userId, name, petType, breed, gender, dob) => {
    console.log("cekcek",userId, name, petType, breed, gender, dob)
    const sql = `INSERT INTO pet_list(name, gender, birth_date, breed, user_id, type) 
  VALUES ($1, $2, $3, $4, $5, $6)`;
    const param = [name, gender, dob, breed, userId, petType];
    const result = await client.query(sql, param);
    return result.rows;
  };

  

module.exports = {
  insertUser,
  getUserByEmail,
  insertUserAddress,
  insertPetList,
};
