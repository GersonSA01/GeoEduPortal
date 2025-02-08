const express = require("express");
const { fetchCoordinates, fetchGDELTNews } = require("../controllers/apiController");

const router = express.Router();

router.get("/coordinates", fetchCoordinates);
router.get("/gdelt-news", fetchGDELTNews);

module.exports = router;
