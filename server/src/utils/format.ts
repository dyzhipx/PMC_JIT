/**
 * Format number with Indonesian locale.
 */
export function formatNumber(n: number | null | undefined): string {
  if (n === undefined || n === null) return "0";
  return n.toLocaleString("id-ID");
}

/**
 * Format date to Indonesian short format.
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Format decimal with controlled precision.
 */
export function formatDecimal(n: number, decimals: number = 2): string {
  if (typeof n !== "number") return "0";
  return n % 1 === 0 ? formatNumber(n) : n.toFixed(decimals);
}

/**
 * Get today's date in YYYY-MM-DD format.
 */
export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get current time in HH:MM:SS format (Indonesian).
 */
export function nowTimeStr(): string {
  return new Date().toLocaleTimeString("id-ID", { hour12: false }).replace(/\./g, ':');
}
