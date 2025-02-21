const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const pointRoutes = require("./routes/pointRoutes");
const { approveUser } = require("./controllers/approveController");
const errorHandler = require("./middleware/errorHandler");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/points", pointRoutes);

app.get("/api/approve", approveUser);
app.use("/api", apiRoutes);

app.use(errorHandler);

module.exports = app;
