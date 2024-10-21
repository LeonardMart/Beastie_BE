const db = require("../config/db.config");
const moment = require("moment");

const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const insertPet = async ({ name, petType, breed, gender, dob, userId }) => {
  const sql = `
  INSERT INTO pet_list 
  (name, gender, birth_date, breed, user_id, type, created_date, updated_date)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const param = [
    name,
    gender,
    dob,
    breed,
    userId,
    petType,
    dateNow(),
    dateNow(),
  ];
  const result = await db.query(sql, param);
  return result.rows;
};

const retrievePet = async ({ userId }) => {
  console.log("cek", userId);
  const sql = `
    SELECT
        pl.pet_id::int as id,
        pl.name,
        pl.gender,
        pl.breed,
        TO_CHAR(pl.birth_date, 'YYYY-MM-DD') as dob,
        pt.type_name as type
    from pet_list pl
    left join pet_type pt on pl.type = pt.type_id
    where pl.user_id = $1
    `;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};

const removePet = async ({ petId, userId }) => {
  const sql = `
    delete from pet_list where pet_id = $1 and user_id = $2
    `;
  const param = [petId, userId];
  const result = await db.query(sql, param);
  return result.rows;
};

module.exports = { insertPet, retrievePet, removePet };
