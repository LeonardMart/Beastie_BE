const db = require("../config/db.config");
const moment = require("moment");

const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const insertAddress = async ({
  userId,
  label,
  detailAddress,
  longitude,
  latitude,
}) => {
  const sql = `
  INSERT INTO user_address 
  (user_id, detail_address, label, location_lat, location_long, created_date, updated_date)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const param = [
    userId,
    detailAddress,
    label,
    latitude,
    longitude,
    dateNow(),
    dateNow(),
  ];
  const result = await db.query(sql, param);
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
        location_long as longitude,
        is_owner as owner_flag
    from user_address
    where user_id = $1
    order by id
    `;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};

const updateUserAddress = async ({
  id,
  userId,
  label,
  detailAddress,
  latitude,
  longitude,
}) => {
  console.log("dapat?", id, userId, label, detailAddress, latitude, longitude);
  const sql = `
    update user_address
    set detail_address =$1, label =$2, location_lat = $3,location_long = $4, updated_date =$5
    where user_id = $6 and id = $7
  `;
  const param = [
    detailAddress,
    label,
    latitude,
    longitude,
    dateNow(),
    userId,
    id,
  ];
  const result = await db.query(sql, param);
  return result.rows;
};

const removeAddress = async ({ addressId, userId }) => {
  console.log("tes", addressId, userId);
  const sql = `
    delete from user_address where id = $1 and user_id = $2
    `;
  const param = [addressId, userId];
  const result = await db.query(sql, param);
  return result.rows;
};

const updateAddressFalse = async ({ userId }) => {
  const sql = `
          update user_address
          set is_owner = false
          where user_id = $1
      `;
  const param = [userId];
  await db.query(sql, param);
};

const updateAddressTrue = async ({ userId, id }) => {
  console.log("cek", userId);
  const sql = `
        update user_address
        set is_owner = true
        where user_id = $1 and id = $2
        `;
  const param = [userId, id];
  const result = await db.query(sql, param);
  return result.rows;
};

module.exports = {
  insertAddress,
  retrieveAddress,
  removeAddress,
  updateAddressFalse,
  updateAddressTrue,
  updateUserAddress
};
