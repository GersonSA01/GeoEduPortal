const express = require("express");
const { getAllPoints, createPoint, updatePoint, deletePoint } = require("../controllers/pointsController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllPoints);
router.post("/", upload.array("images"), createPoint);
router.put("/:id", upload.array("images"), updatePoint);
router.delete("/:id", deletePoint);

module.exports = router;
