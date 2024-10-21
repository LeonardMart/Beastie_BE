const express = require("express")
const router = express.Router();
const authController = require("../controllers/login-controller");

router.get("/login/:email/:pass", authController.retrieveUser);
router.get("/retrieve/:userId", authController.retrieveUserByUserId);
module.exports = router