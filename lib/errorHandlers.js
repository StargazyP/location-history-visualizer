const multer = require("multer");

const { MAX_ZIP_BYTES } = require("./config");

function registerErrorHandlers(app) {
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: `ZIP 크기는 최대 ${Math.floor(MAX_ZIP_BYTES / 1024 / 1024)}MB까지 허용됩니다.`,
        });
      }
      return res.status(400).json({ error: err.message || err.code });
    }
    if (err && typeof err.message === "string" && req.path && req.path.startsWith("/api/upload")) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    if (res.headersSent) return;
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  });
}

module.exports = { registerErrorHandlers };
