const JSZip = require("jszip");

function normalizeIso(ts) {
  if (!ts) return null;
  if (typeof ts === "string") return new Date(ts).toISOString();
  if (typeof ts === "object" && ts.seconds != null) {
    const ms = Number(ts.seconds) * 1000 + Math.floor(Number(ts.nanos || 0) / 1e6);
    return new Date(ms).toISOString();
  }
  return String(ts);
}

function inferSemanticType(pv) {
  const loc = pv.location || {};
  const name = `${loc.name || ""} ${loc.address || ""}`.toLowerCase();
  if (/home|집|自宅|홈/.test(name)) return "Home";
  if (/work|office|직장|会社|office/i.test(name)) return "Work";
  const raw =
    loc.semanticType ||
    pv.semanticType ||
    pv.editConfirmationStatus ||
    "";
  const s = String(raw).toUpperCase();
  if (s.includes("HOME")) return "Home";
  if (s.includes("WORK")) return "Work";
  return "Unknown";
}

function visitFromPlaceVisit(pv) {
  const latE7 =
    pv.centerLatE7 ??
    pv.location?.latitudeE7 ??
    pv.location?.latE7;
  const lngE7 =
    pv.centerLngE7 ??
    pv.location?.longitudeE7 ??
    pv.location?.lngE7;
  if (latE7 == null || lngE7 == null) return null;

  const lat = Number(latE7) / 1e7;
  const lng = Number(lngE7) / 1e7;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const dur = pv.duration || {};
  const startRaw = dur.startTimestamp ?? dur.start;
  const endRaw = dur.endTimestamp ?? dur.end;
  const startTime = normalizeIso(startRaw);
  const endTime = normalizeIso(endRaw);
  if (!startTime || !endTime) return null;

  return {
    startTime,
    endTime,
    placeLocation: `geo:${lat},${lng}`,
    semanticType: inferSemanticType(pv),
  };
}

function extractVisitsFromTimelineData(data) {
  const visits = [];
  const objects = data.timelineObjects;
  if (!Array.isArray(objects)) return visits;

  for (const obj of objects) {
    if (!obj || !obj.placeVisit) continue;
    const v = visitFromPlaceVisit(obj.placeVisit);
    if (v) visits.push(v);
  }
  return visits;
}

async function parseTakeoutZipBuffer(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const visits = [];

  const names = Object.keys(zip.files).filter(
    (n) => !zip.files[n].dir && n.toLowerCase().endsWith(".json")
  );

  for (const name of names) {
    const lower = name.toLowerCase();
    if (
      lower.includes("settings") ||
      lower.includes("manifest") ||
      lower.includes("metadata")
    ) {
      continue;
    }
    let text;
    try {
      text = await zip.file(name).async("text");
    } catch {
      continue;
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      continue;
    }
    visits.push(...extractVisitsFromTimelineData(data));
  }

  return visits;
}

module.exports = {
  normalizeIso,
  inferSemanticType,
  visitFromPlaceVisit,
  extractVisitsFromTimelineData,
  parseTakeoutZipBuffer,
};
