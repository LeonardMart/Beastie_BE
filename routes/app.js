const router = require("express").Router();
const express = require("express")
const compression = require("compression");
const authorize = require("../middleware/verifyToken")
const incomingRequestLogger = require("../middleware/incoming-request-logger");
const errorLogger = require("../middleware/error-logger");
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(incomingRequestLogger);
// app.use(authorize);
// router.post("/register", authController.createUser);
// router.post("/login", authController.loginUser);

app.use("/authregister", require("./regist"));
app.use("/authlogin", require("./login"))
app.use("/authpet", require("./pet"))
app.use("/authaddress", require("./address"))
app.use("/authPetOwner", require("./pet-owner"))


app.use("/authregisterpf", require("./registerPf"));
app.use("/authretrievepf", require("./petfriend"));
app.use("/authserviceprice", require("./petfriend"));
app.use("/authPf", require("./petfriend")); //kedepan pake ini aja

app.use(errorLogger)

module.exports = app