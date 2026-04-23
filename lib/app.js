const express = require("express");
const cors = require("cors");

const { PUBLIC_DIR } = require("./config");
const { registerErrorHandlers } = require("./errorHandlers");
const { registerRoutes } = require("./routes");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.static(PUBLIC_DIR));

  registerRoutes(app);
  registerErrorHandlers(app);

  return app;
}

module.exports = { createApp };
