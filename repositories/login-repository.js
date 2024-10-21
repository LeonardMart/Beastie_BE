const db = require("../config/db.config");
const moment = require("moment");

const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const retrieveUser = async ({ email, pass }) => {
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
          'longitude', location_long,
          'owner_flag', is_owner
      )order by id
    ) as userAddress
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
WHERE LOWER(ul.email) = LOWER($1) AND ul.password = $2; `;
  const param = [email, pass];
  const result = await db.query(sql, param);
  return result.rows;
};

const retrieveUserByUserId = async ({ userId }) => {
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
          'longitude', location_long,
          'owner_flag', is_owner
      )order by id
    ) as userAddress
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
      )order by pet_id
    ) as pets
  FROM pet_list pl
  LEFT JOIN pet_type pt ON pl.type = pt.type_id
  GROUP BY user_id
) pl ON ul.user_id = pl.user_id
WHERE ul.user_id = $1`;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};



module.exports = { retrieveUser, retrieveUserByUserId };
