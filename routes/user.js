const router = require("express").Router();
const userController = require("../controllers/userController");
const { verifyAndAuthorization, verifyAndAdmin } = require("../middleware/verifyToken");


// UPDATE
router.put("/", verifyAndAuthorization, userController.updateUser);


// DELETE 
router.delete("/", verifyAndAuthorization, userController.deleteUser);

// GET
router.get("/", verifyAndAuthorization, userController.getUser);

// GET
router.get("/", verifyAndAdmin, userController.getAllUser);



module.exports = router