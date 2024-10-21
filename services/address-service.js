require("dotenv").config();

const repo = require("../repositories/address-repository");

// const checkUser = async (email) => {
//   const result = await repo.getUserByEmail(email);
//   return result;
// };

// const insertLocation = async({location})=>{
//   if(location.length > 0){
//     const insertQuery = location.map((loc)=>{
//       const result = `${loc.latitude}`
//       return result
//     })
//     const manipulateArray = insertQuery.join()
//     console.log("anjayani", manipulateArray)
//   }
// }

const retrieveAddress = async ({ userId }) => {
  let data = await repo.retrieveAddress({userId});
  const newData = data.map((item) => ({
    ...item,
    detailAddress: item.detailaddress,
  }));
  return newData
};

module.exports = {
  retrieveAddress,
};
