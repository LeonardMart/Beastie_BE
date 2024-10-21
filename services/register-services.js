require("dotenv").config();

const repo = require("../repositories/register-repository");


const checkUser = async (email) => {
  const result = await repo.getUserByEmail(email);
  return result;
};

const insertLocation = async({location})=>{
  if(location.length > 0){
    const insertQuery = location.map((loc)=>{
      const result = `${loc.latitude}`
      return result
    })
  }
}


module.exports = {
  checkUser,
  insertLocation
};
