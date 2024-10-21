const express = require("express");
const router = express.Router();
const authController = require("../controllers/pf-controller");

router.get("/retrieve/:userId", authController.retrievePfInfo);
router.post("/update-insert/", authController.updateInsertServicePricelist);
router.post("/updateStatus/", authController.updatePfStatus);

router.post(
  "/updateSelectedAddressPf/",
  authController.updateSelectedPfAddress
);
router.post("/updateAddressPf/", authController.updatePfAddress);
router.post("/addAddressPf/", authController.insertPfAddress);
router.delete(
  "/removeAddressPf/:userId/:addressId",
  authController.removePfAddress
);

router.get("/getPfReviews/:userId", authController.getReview)

router.post("/cancelOrder", authController.cancelOrder);
router.post("/confirmOrder", authController.confirmOrder);
router.post("/petReceived", authController.petReceived);
router.post("/finishPetCare", authController.finishPetCare);
router.post("/finishOrder", authController.finishOrder);

module.exports = router;
