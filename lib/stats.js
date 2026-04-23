function computeStats(visits) {
  let home = 0;
  let work = 0;
  let other = 0;
  let minMs = Infinity;
  let maxMs = -Infinity;

  for (const v of visits) {
    const t = v.semanticType || "Unknown";
    if (t === "Home") home += 1;
    else if (t === "Work") work += 1;
    else other += 1;
    const s = new Date(v.startTime).getTime();
    const e = new Date(v.endTime).getTime();
    if (Number.isFinite(s) && s < minMs) minMs = s;
    if (Number.isFinite(e) && e > maxMs) maxMs = e;
  }

  const dateRange =
    minMs !== Infinity && maxMs !== -Infinity
      ? {
          start: new Date(minMs).toISOString(),
          end: new Date(maxMs).toISOString(),
          startYear: new Date(minMs).getFullYear(),
          endYear: new Date(maxMs).getFullYear(),
        }
      : null;

  return {
    total: visits.length,
    home,
    work,
    other,
    dateRange,
  };
}

module.exports = { computeStats };
