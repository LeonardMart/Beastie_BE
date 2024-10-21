const express = require("express")
const router = express.Router();
const authController = require("../controllers/pet-controller");

router.post("/insert/", authController.addPet);
router.get("/retrieve/:userId", authController.retrievePet)
router.delete("/remove/:petId/:userId", authController.removePet);

module.exports = router