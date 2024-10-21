const express = require("express")
const router = express.Router();
const authController = require("../controllers/register-pf-controller");

const multer = require("multer")
const storage = multer.memoryStorage()
upload = multer({storage})

// REGISTRATION 

router.post("/register", authController.registerPf);
router.get("/retrieveById/:userId", authController.retrieveUserById)


// LOGIN 
// router.post("/login", authController.loginUser);


module.exports = router