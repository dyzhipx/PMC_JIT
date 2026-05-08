/**
 * Format number with Indonesian locale.
 */
export function formatNumber(n) {
    if (n === undefined || n === null)
        return "0";
    return n.toLocaleString("id-ID");
}
/**
 * Format date to Indonesian short format.
 */
export function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
/**
 * Format decimal with controlled precision.
 */
export function formatDecimal(n, decimals = 2) {
    if (typeof n !== "number")
        return "0";
    return n % 1 === 0 ? formatNumber(n) : n.toFixed(decimals);
}
/**
 * Get today's date in YYYY-MM-DD format.
 */
export function todayStr() {
    return new Date().toISOString().split("T")[0];
}
/**
 * Get current time in HH:MM:SS format (Indonesian).
 */
export function nowTimeStr() {
    return new Date().toLocaleTimeString("id-ID", { hour12: false }).replace(/\./g, ':');
}
