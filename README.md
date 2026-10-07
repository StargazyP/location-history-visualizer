# Timeline Visits Map

Google Takeout **위치 기록(시맨틱, JSON)** ZIP을 업로드하면 `placeVisit`만 추려 `public/visits.json`으로 저장하고, **MapLibre** 지도에서 시간순으로 탐색합니다.

## 기술 스택

| 구분 | 사용 |
|------|------|
| 서버 | Node.js 18+, Express, Multer, JSZip |
| 프론트 | `upload.html` (업로드 마법사), `public/index.html` (지도, MapLibre CDN) |
| 배포 | Docker Compose (권장) 또는 PM2 (`ecosystem.config.js`) |

## 빠른 시작 (Docker)

```bash
cd /home/jangdonggun/포트폴리오/timeline
docker compose up -d --build
```

- 업로드 UI: `http://localhost:3004/`
- 지도: `http://localhost:3004/index` 또는 `http://localhost:3004/index.html`
- 헬스: `GET /api/health`

호스트 포트를 바꾸려면 `TIMELINE_PORT=3005 docker compose up -d` 처럼 환경 변수를 사용합니다.

### 볼륨

| 마운트 | 설명 |
|--------|------|
| `./public` | `visits.json`, `index.html` (업로드 결과가 호스트에 유지됨) |
| `./uploads` | 업로드 임시 파일 |
| `./data`, `./logs` | 데이터·로그 (선택) |

## 로컬 실행 (개발)

```bash
npm install
npm run dev
# 또는
npm start
```

기본 포트는 **3004** (`PORT` 환경 변수로 변경 가능).

## 프로젝트 구조

```
timeline/
├── server.js           # Express API + OSM 타일 프록시
├── upload.html         # 업로드 페이지 (GET /)
├── package.json
├── docker-compose.yml
├── Dockerfile
├── ecosystem.config.js   # PM2 (호스트에서 직접 실행 시)
├── public/
│   ├── index.html      # 지도
│   └── visits.json     # 업로드 후 생성·갱신
├── uploads/            # 임시 ZIP (자동 생성)
└── logs/               # PM2 로그 등
```

## API 요약

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/` | 업로드 HTML |
| GET | `/index` | 지도 HTML |
| GET | `/api/health` | 헬스체크 |
| POST | `/api/upload/preview` | ZIP 미리보기 (`zipfile`, 통계만) |
| POST | `/api/upload` | ZIP 처리 후 `visits.json` 저장 |
| GET | `/api/stats` | 현재 `visits.json` 통계 |
| GET | `/api/download` | `visits.json`을 인라인 삽입한 단일 HTML 다운로드 |
| GET | `/api/tiles/:z/:x/:y.png` | OSM 래스터 타일 프록시 (CORS·User-Agent) |

응답 형식은 기존 `upload.html` / `index.html`과 맞추었습니다 (`stats.home` / `work` / `other`, `dateRange.startYear` 등).

## 데이터 형식 (visits.json)

배열. 한 항목 예:

```json
{
  "startTime": "2016-01-30T05:59:45.398Z",
  "endTime": "2016-01-30T07:02:14.837Z",
  "placeLocation": "geo:37.761956,127.040930",
  "semanticType": "Unknown"
}
```

ZIP 안의 Google JSON은 `timelineObjects[].placeVisit`만 읽으며, 집/직장 분류는 장소 이름 휴리스틱 + 일부 필드로 **가능한 경우에만** 채웁니다.

## 제한 사항

- ZIP 최대 크기 **500MB** (서버·미리보기 동일 상한).
- **시맨틱 위치 기록** JSON이 포함된 Takeout이어야 합니다. 월별 JSON 등 여러 파일이 ZIP에 있어도 모두 스캔합니다.
- GitHub Webhook 자동 배포 등은 이 저장소에 **포함하지 않습니다** (필요 시 별도 스크립트).

## 라이선스

MIT
