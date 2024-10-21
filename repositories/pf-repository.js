const db = require("../config/db.config");
const moment = require("moment");

const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const retrievePfInfo = async ({ userId }) => {
  const sql = `
    select
    ul.user_id,
    ul.username,
    pf.price_daily::text AS daily_price,
    pf.price_hourly::text AS hourly_price,
    ul.pf_flag,
    ap.accept_dog,
    ap.accept_cat,
    ap.accept_other,
    ad.user_addresses,
    ts.additional_service,
    pf.is_active
    from user_list ul
    left join accepted_pet ap on ap.user_id = ul.user_id
    left join pet_friend pf on pf.user_id = ul.user_id
    LEFT JOIN (
    SELECT 
        user_id,
        json_agg(json_build_object(
            'id', id,
                'label', label,
                'detail_address', detail_address,
                'latitude', location_lat,
                'longitude', location_long,
                'pf_flag', is_pet_friend
        )order by id
      ) as user_addresses
    FROM user_address
    GROUP BY user_id
    ) ad ON ul.user_id = ad.user_id
    left join(
    select
        user_id,
        json_agg(json_build_object(
            'id', task_id,
            'service_name', service_name,
            'price', price,
            'accept_dog',accept_dog,
            'accept_cat', accept_cat,
            'accept_other',accept_other
        )) as additional_service
    from task_service
    group by user_id
    ) ts on ul.user_id = ts.user_id
    where ul.user_id = $1 and ul.pf_flag = true`;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};

const updatePfStatus = async ({ isActive, userId }) => {
  const sql = `
    update pet_friend set is_active = $1
    where user_id = $2
    `;
  const param = [isActive, userId];
  const result = await db.query(sql, param);
  return result.rows;
};

const updateAddressFalse = async ({ userId }) => {
  const sql = `
          update user_address
          set is_pet_friend = false
          where user_id = $1
      `;
  const param = [userId];
  await db.query(sql, param);
};

const updateAddressTrue = async ({ userId, id }) => {
  console.log("cek", userId);
  const sql = `
        update user_address
        set is_pet_friend = true
        where user_id = $1 and id = $2
        `;
  const param = [userId, id];
  const result = await db.query(sql, param);
  return result.rows;
};

const insertUserAddress = async ({
  userId,
  label,
  detail_address,
  latitude,
  longitude,
}) => {
  console.log("knp", userId, label, detail_address, latitude, longitude);
  const sql = `
  INSERT INTO user_address 
  (user_id, detail_address, label, location_lat, location_long, created_date, updated_date)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const param = [
    userId,
    detail_address,
    label,
    latitude,
    longitude,
    dateNow(),
    dateNow(),
  ];
  const result = await db.query(sql, param);
  return result.rows;
};

const updateUserAddress = async ({
  id,
  userId,
  label,
  detail_address,
  latitude,
  longitude,
}) => {
  console.log("dapat?", id, userId, label, detail_address, latitude, longitude);
  const sql = `
    update user_address
    set detail_address =$1, label =$2, location_lat = $3,location_long = $4, updated_date =$5
    where user_id = $6 and id = $7
  `;
  const param = [
    detail_address,
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

const removePfAddress = async ({ userId, addressId }) => {
  const sql = `
   delete from user_address 
   where user_id = $1 and 
    id = $2
  `;
  const param = [userId, addressId];
  const result = await db.query(sql, param);
  return result.rows;
};

const updateIsOrder = async ({ userId }) => {
  const sql = `
  update pet_friend
  set is_order = false where user_id = $1
  `;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};

const cancelOrder = async ({ orderId }) => {
  const sql = `
    update orders
    set is_canceled_pf = true where order_id = $1
  `;
  const param = [orderId];
  const result = await db.query(sql, param);
  return result.rows;
};

const confirmOrder = async ({ orderId }) => {
  const sql = `
    update orders
    set is_confirm_pf = true where order_id = $1
  `;
  const param = [orderId];
  const result = await db.query(sql, param);
  return result.rows;
};

const petReceived = async ({ orderId }) => {
  const sql = `
    update orders
    set is_pet_received = true where order_id = $1
  `;
  const param = [orderId];
  const result = await db.query(sql, param);
  return result.rows;
};

const finishPetCare = async ({ orderId }) => {
  const sql = `
    update orders
    set is_finish_pet_care = true where order_id = $1
  `;
  const param = [orderId];
  const result = await db.query(sql, param);
  return result.rows;
};

const finishOrder = async ({ orderId }) => {
  const sql = `
    update orders
    set is_finish_pf = true where order_id = $1
  `;
  const param = [orderId];
  const result = await db.query(sql, param);
  return result.rows;
};

const getReview = async ({ userId }) => {
  const sql = `
 select
      id,
      rating,
      description,
      created_date,
      (select username from user_list where user_id = r.owner_id) as pet_owner
  from reviews r
  where pf_id = $1
  `;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};

module.exports = {
  retrievePfInfo,
  updatePfStatus,
  updateAddressFalse,
  updateAddressTrue,
  insertUserAddress,
  updateUserAddress,
  removePfAddress,
  updateIsOrder,
  cancelOrder,
  confirmOrder,
  petReceived,
  finishPetCare,
  finishOrder,
  getReview
};
