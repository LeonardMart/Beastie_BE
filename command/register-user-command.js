const db = require("../config/db.config");
const service = require("../services/register-services");
const repo = require("../repositories/register-repository");
const bcrypt = require("bcrypt");
const uuid = require("../utils/generate-uuid");
const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const registerUserCommand = async ({
  email,
  name,
  phoneNum,
  password,
  location,
  pets,
}) => {
  const commit = async () => {
    const client = await db.connect();
    try {
      await client.query("Begin");
      const userId = uuid();
      const encryptPass = await bcrypt.hash(password, 10);
      const checkEmail = await service.checkUser(email);
      console.log("tes", checkEmail);
      if (checkEmail == 0) {
        await repo.insertUser(client)(userId, email, name, phoneNum, password);
        if (location.length > 0) {
          await Promise.all(
            location.map(async (loc) => {
              await repo.insertUserAddress(client)(
                userId,
                loc.label,
                loc.detailAddress,
                loc.latitude,
                loc.longitude
              );
            })
          );
        }
        if (pets.length > 0) {
          console.log("masuk pet")
          await Promise.all(
            pets.map(async (pet) => {
              await repo.insertPetList(client)(
                userId,
                pet.name,
                pet.petType,
                pet.breed,
                pet.gender,
                pet.dob
              );
            })
          );
        }
        await client.query("COMMIT");
        return { status: 1 };
      } else {
        await client.query("ROLLBACK");
        return { status: 0, message: "user already registered" };
      }
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

module.exports = registerUserCommand;
