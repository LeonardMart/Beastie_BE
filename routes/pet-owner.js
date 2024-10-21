const express = require("express")
const router = express.Router();
const authController = require("../controllers/order-controller");

router.post("/order", authController.getPf);
router.get("/retrievePf/:userId/:userLat/:userLong/:ownerId", authController.getPfbyId);
router.get("/retrieveTaskService/:userId/:petType", authController.getPfTaskService);
router.get("/retrieveTaskService/:userId", authController.getPfTaskService);

router.post("/createOrder", authController.createOrder);
router.post("/createReview", authController.createReview);
router.get("/retrieveOwnerOrder/:userId", authController.getOwnerOrder);
router.get("/retrievePfOrder/:userId", authController.getPfOrder)

router.post("/finishOrder/", authController.finishOrder)

router.post("/bookmarkPf/", authController.bookmarkPf)
router.post("/getBookmarkPf", authController.getBookmarkPf)

module.exports = router