const express = require("express");
const { register, login, changePassword } = require("../controllers/authController");
const { approveUser } = require("../controllers/approveController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/approve", approveUser);
router.put("/change-password", authenticateUser, changePassword);

module.exports = router;
