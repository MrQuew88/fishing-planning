/**
 * Returns today's date as YYYY-MM-DD in Europe/Dublin timezone.
 * Avoids the UTC offset bug where `new Date().toISOString().slice(0,10)`
 * returns yesterday's date when the server runs in UTC after midnight Irish time.
 */
export function getTodayIrish(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Dublin" });
}

/**
 * Returns tomorrow's date as YYYY-MM-DD in Europe/Dublin timezone.
 */
export function getTomorrowIrish(): string {
  const d = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Dublin" })
  );
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
