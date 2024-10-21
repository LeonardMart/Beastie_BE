const express = require("express");
const router = express.Router();
const authController = require("../controllers/address-controller");

// router.post("/insert/", authController.addPet);
// router.get("/retrieve/:userId", authController.retrievePet)
// router.delete("/remove/:petId/:userId", authController.removePet);

router.post("/insert", authController.addAddress);
router.get("/retrieve/:userId", authController.retrieveAddress)
router.delete("/remove/:addressId/:userId", authController.removeAddress);
router.post("/updateSelectedAddress", authController.updateSelectedAddress);
router.post("/updateAddress", authController.updateUserAddress);
module.exports = router;
