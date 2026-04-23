const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const UPLOADS_DIR = path.join(ROOT, "uploads");
const DATA_DIR = path.join(ROOT, "data");
const VISITS_JSON = path.join(PUBLIC_DIR, "visits.json");

const PORT = Number(process.env.PORT) || 3004;
const MAX_ZIP_BYTES = 500 * 1024 * 1024;

module.exports = {
  ROOT,
  PUBLIC_DIR,
  UPLOADS_DIR,
  DATA_DIR,
  VISITS_JSON,
  PORT,
  MAX_ZIP_BYTES,
};
