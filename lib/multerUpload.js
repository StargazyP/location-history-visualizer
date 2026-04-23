const multer = require("multer");

const { MAX_ZIP_BYTES, UPLOADS_DIR } = require("./config");

function zipFileFilter(_req, file, cb) {
  const ok =
    file.mimetype === "application/zip" ||
    file.mimetype === "application/x-zip-compressed" ||
    (file.originalname || "").toLowerCase().endsWith(".zip");
  if (!ok) {
    return cb(new Error("ZIP 파일만 업로드할 수 있습니다."));
  }
  cb(null, true);
}

const uploadMem = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_ZIP_BYTES },
  fileFilter: zipFileFilter,
});

const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const safe = (file.originalname || "takeout.zip").replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: MAX_ZIP_BYTES },
  fileFilter: zipFileFilter,
});

module.exports = { uploadMem, uploadDisk };
