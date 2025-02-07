const express = require("express");
const { register, login } = require("../controllers/authController");
const { approveUser } = require("../controllers/approveController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/approve", approveUser); 

module.exports = router;
