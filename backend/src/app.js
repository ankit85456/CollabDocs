const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errormiddleware");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/docs", require("./routes/documentroutes"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);

module.exports = app;
