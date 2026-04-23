const fs = require("fs").promises;
const path = require("path");
const https = require("https");

const { PORT, ROOT, PUBLIC_DIR, VISITS_JSON } = require("./config");
const { parseTakeoutZipBuffer } = require("./takeoutParser");
const { computeStats } = require("./stats");
const { uploadMem, uploadDisk } = require("./multerUpload");

function registerRoutes(app) {
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "timeline-visits-map", port: PORT });
  });

  app.get("/api/stats", async (_req, res) => {
    try {
      const raw = await fs.readFile(VISITS_JSON, "utf8");
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return res.status(500).json({ error: "visits.json 형식이 올바르지 않습니다." });
      }
      res.json({ success: true, stats: computeStats(data) });
    } catch (e) {
      if (e.code === "ENOENT") {
        return res.status(404).json({ error: "아직 업로드된 데이터가 없습니다." });
      }
      res.status(500).json({ error: String(e.message || e) });
    }
  });

  app.post("/api/upload/preview", uploadMem.single("zipfile"), async (req, res) => {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "zipfile 필드가 필요합니다." });
    }
    try {
      const visits = await parseTakeoutZipBuffer(req.file.buffer);
      if (visits.length === 0) {
        return res.status(400).json({
          error:
            "ZIP 안에서 위치 기록(JSON, timelineObjects.placeVisit)을 찾지 못했습니다. Google Takeout 위치 기록(시맨틱) JSON이 포함된 ZIP인지 확인하세요.",
        });
      }
      const stats = computeStats(visits);
      return res.json({ success: true, stats, totalRecords: stats.total });
    } catch (e) {
      console.error("preview", e);
      return res.status(500).json({ error: String(e.message || e) });
    }
  });

  app.post("/api/upload", uploadDisk.single("zipfile"), async (req, res) => {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "zipfile 필드가 필요합니다." });
    }
    const tempPath = req.file.path;
    try {
      const buffer = await fs.readFile(tempPath);
      const visits = await parseTakeoutZipBuffer(buffer);
      if (visits.length === 0) {
        return res.status(400).json({
          error:
            "ZIP 안에서 위치 기록을 찾지 못했습니다. Takeout 위치 기록(시맨틱) JSON 형식인지 확인하세요.",
        });
      }
      await fs.writeFile(VISITS_JSON, JSON.stringify(visits), "utf8");
      const stats = computeStats(visits);
      res.json({
        success: true,
        message: "업로드가 완료되었습니다.",
        stats,
      });
    } catch (e) {
      console.error("upload", e);
      res.status(500).json({ error: String(e.message || e) });
    } finally {
      await fs.unlink(tempPath).catch(() => {});
    }
  });

  app.get("/api/download", async (_req, res) => {
    try {
      const [htmlRaw, visitsRaw] = await Promise.all([
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), "utf8"),
        fs.readFile(VISITS_JSON, "utf8"),
      ]);
      const inject = `<script>window.VISITS_DATA=${visitsRaw};</script>\n`;
      const out = htmlRaw.replace("<head>", `<head>\n${inject}`);
      res.setHeader("Content-Disposition", 'attachment; filename="timeline-map.html"');
      res.type("html").send(out);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });

  app.get("/api/tiles/:z/:x/:y.png", (req, res) => {
    const { z, x, y } = req.params;
    const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    const req2 = https.get(
      url,
      {
        headers: {
          "User-Agent": "timeline-visits-map/1.0 (https://github.com/)",
        },
      },
      (r) => {
        if (r.statusCode && r.statusCode >= 400) {
          res.status(r.statusCode).end();
          return;
        }
        res.setHeader("Content-Type", "image/png");
        r.pipe(res);
      }
    );
    req2.on("error", () => res.status(502).end());
  });

  app.get("/", (_req, res) => {
    res.sendFile(path.join(ROOT, "upload.html"));
  });

  app.get("/index", (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
  });
}

module.exports = { registerRoutes };
