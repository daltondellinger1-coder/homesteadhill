export type Range = { start_date: string; end_date: string };

/** First day >= today not inside any half-open [start, end) busy range (ISO YYYY-MM-DD). */
export function computeNextFree(today: string, ranges: Range[]): string {
  const sorted = [...ranges].sort((a, b) => a.start_date.localeCompare(b.start_date));
  let d = today;
  let moved = true;
  while (moved) {
    moved = false;
    for (const r of sorted) {
      if (r.start_date <= d && d < r.end_date) { d = r.end_date; moved = true; }
    }
  }
  return d;
}

export function decide(nextFree: string, current: string, _source: string | null) {
  if (nextFree > current) return "updated_later" as const;
  if (nextFree < current) return "kept_marketing_lag" as const;
  return "unchanged" as const;
}
