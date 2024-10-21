require("dotenv").config();
const haversine = require("haversine");
const repo = require("../repositories/order-repository");
const moment = require("moment");

const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const truncateToOneDecimal = (num) => {
  return Math.floor(num * 10) / 10;
};

const calculateDistance = async ({
  userLat,
  userLong,
  location_lat,
  location_long,
}) => {
  const start = { latitude: userLat, longitude: userLong };
  const end = { latitude: location_lat, longitude: location_long };
  const distance = haversine(start, end);
  return truncateToOneDecimal(distance);
};

const getPf = async ({ userId, userLat, userLong, searchKeyword }) => {
  let data = await repo.getPf({ userId, searchKeyword });
  console.log(data);
  let newData;
  if (data) {
    newData = await Promise.all(
      data.map(async (item) => {
        const distance = await calculateDistance({
          userLat,
          userLong,
          location_lat: item.location_lat,
          location_long: item.location_long,
        });

        return {
          ...item,
          distance,
        };
      })
    );
    newData.sort((a, b) => a.distance - b.distance);
  }

  return newData;
};

const getPfById = async ({ userId, userLat, userLong, ownerId }) => {
  console.log("tes", userId, userLat, userLong);
  let data = await repo.getPfById({ userId, ownerId });
  console.log("hahaha",data);
  let newData;
  if (data) {
    newData = await Promise.all(
      data.map(async (item) => {
        const distance = await calculateDistance({
          userLat,
          userLong,
          location_lat: item.location_lat,
          location_long: item.location_long,
        });

        return {
          ...item,
          distance,
        };
      })
    );
    newData.sort((a, b) => a.distance - b.distance);
  }
  console.log(newData);
  return newData;
};

const getPfTaskService = async ({ userId, petType }) => {
  let data = await repo.getPfTaskService({ userId });
  let newData;
  if (petType == "Dog") {
    newData = data.filter((item) => item.accept_dog == true);
  } else if (petType == "Cat") {
    newData = data.filter((item) => item.accept_cat == true);
  } else {
    newData = data.filter((item) => item.accept_other == true);
  }
  return newData;
};

const insertOrderAddresses =
  (client) =>
  async ({ orderId, userId, pfId, owner_address_id, pf_address_id }) => {
    if (userId) {
      const data = await repo.retrieveOwnerAddress(client)({
        userId,
        owner_address_id,
      });
      console.log("datadata", data.id);
      if (data) {
        const user_id = userId;
        const { id, label, detail_address, location_lat, location_long } = data;
        await repo.insertOrderAddresses(client)({
          orderId,
          user_id,
          id,
          label,
          detail_address,
          location_lat,
          location_long,
        });
      }
    }

    if (pfId) {
      const data = await repo.retrievePfAddress(client)({
        pfId,
        pf_address_id,
      });
      console.log("data", pfId, pf_address_id);
      if (data) {
        const { id, label, detail_address, location_lat, location_long } =
          data[0];
        const user_id = pfId;
        await repo.insertOrderAddresses(client)({
          orderId,
          user_id,
          id,
          label,
          detail_address,
          location_lat,
          location_long,
        });
      }
    }
  };

const getOwnerOrderList = async ({ userId }) => {
  const data = await repo.getOwnerOrderList({ userId });
  console.log("tes222", data);
  let statusData;

  if (data) {
    statusData = data.map(async (item) => {
      let status = "";
      const currentDate = dateNow();
      const startDate = new Date(item.start_date);

      if (item.is_canceled_pf) {
        status = "Canceled by Pet Friend";
      } else if (item.is_canceled_owner) {
        status = "Canceled by Pet Owner";
      } else if (startDate > new Date(currentDate)) {
        status = "Upcoming";
      } else if (startDate <= new Date(currentDate)) {
        status = "Ongoing";
      }

      if (
        // item.end_date < new Date(currentDate) &&
        // item.is_confirm_pf &&
        // (!item.is_canceled_pf || !item.is_canceled_owner) &&
        item.is_finish_pf &&
        item.is_finish_owner
      ) {
        status = "Complete";
      } else if (
        item.end_date < new Date(currentDate) &&
        (!item.is_confirm_pf || !item.is_finish_pf || !item.is_finish_owner)
      ) {
        status = "Canceled by System";
      }

      const pfAddress = item.address.find(
        (addr) => addr.id === Number(item.pf_address_id)
      );
      const ownerAddress = item.address.find(
        (addr) => addr.id === Number(item.owner_address_id)
      );
      const distance = await calculateDistance({
        userLat: ownerAddress.lat,
        userLong: ownerAddress.long,
        location_lat: pfAddress.lat,
        location_long: pfAddress.long,
      });

      pfAddress.distance = distance;
      return { ...item, status, distance };
    });
    statusData = await Promise.all(statusData);
  }

  console.log("te", statusData);
  return statusData;
};

const getPfOrderList = async ({ userId }) => {
  const data = await repo.getPfOrderList({ userId });
  console.log("tes222", data);
  let statusData;

  if (data) {
    statusData = data.map(async (item) => {
      let status = "";
      const currentDate = dateNow();
      const startDate = new Date(item.start_date);

      if (item.is_canceled_pf) {
        status = "Canceled by Pet Friend";
      } else if (item.is_canceled_owner) {
        status = "Canceled by Pet Owner";
      } else if (startDate > new Date(currentDate)) {
        status = "Upcoming";
      } else if (startDate <= new Date(currentDate)) {
        status = "Ongoing";
      }

      if (
        // item.end_date < new Date(currentDate) &&
        // item.is_confirm_pf &&
        // (!item.is_canceled_pf || !item.is_canceled_owner) &&
        item.is_finish_pf &&
        item.is_finish_owner
      ) {
        status = "Complete";
      } else if (
        item.end_date < new Date(currentDate) &&
        (!item.is_confirm_pf || !item.is_finish_pf || !item.is_finish_owner)
      ) {
        status = "Canceled by System";
      }

      const pfAddress = item.address.find(
        (addr) => addr.id === Number(item.pf_address_id)
      );
      const ownerAddress = item.address.find(
        (addr) => addr.id === Number(item.owner_address_id)
      );

      const distance = await calculateDistance({
        userLat: pfAddress.lat,
        userLong: pfAddress.long,
        location_lat: ownerAddress.lat,
        location_long: ownerAddress.long,
      });
      pfAddress.distance = distance;
      return { ...item, status, distance };
    });
    statusData = await Promise.all(statusData);
  }

  console.log("te", statusData);
  return statusData;
};

const insertPet =
  (client) =>
  async ({ orderId, userId, id }) => {
    const data = await repo.retrievePetbyPetId(client)({ id });
    if (data) {
      const { name, gender, birth_date, breed, type } = data[0];
      await repo.insertOrderPet(client)({
        orderId,
        id,
        userId,
        name,
        gender,
        birth_date,
        breed,
        type,
      });
    }
  };

module.exports = {
  getPf,
  getPfById,
  getPfTaskService,
  insertOrderAddresses,
  insertPet,
  getOwnerOrderList,
  getPfOrderList,
};
