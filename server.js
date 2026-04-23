/**
 * Google Takeout (Semantic Location History) ZIP 업로드 → visits.json 생성 + 정적 지도 서빙
 * 엔트리: lib/ 모듈로 분리됨 (createApp, 파서, 라우트 등)
 */
const { createApp } = require("./lib/app");
const { PORT } = require("./lib/config");
const { ensureDirs } = require("./lib/fsutil");

const app = createApp();

ensureDirs()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`timeline-visits-map listening on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
