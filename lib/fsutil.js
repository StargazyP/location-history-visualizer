const fs = require("fs").promises;
const path = require("path");

const { UPLOADS_DIR, DATA_DIR, PUBLIC_DIR, ROOT } = require("./config");

function ensureDirs() {
  return Promise.all([
    fs.mkdir(UPLOADS_DIR, { recursive: true }),
    fs.mkdir(DATA_DIR, { recursive: true }),
    fs.mkdir(path.join(ROOT, "logs"), { recursive: true }),
    fs.mkdir(PUBLIC_DIR, { recursive: true }),
  ]);
}

module.exports = { ensureDirs };
