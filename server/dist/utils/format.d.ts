/**
 * Format number with Indonesian locale.
 */
export declare function formatNumber(n: number | null | undefined): string;
/**
 * Format date to Indonesian short format.
 */
export declare function formatDate(dateStr: string): string;
/**
 * Format decimal with controlled precision.
 */
export declare function formatDecimal(n: number, decimals?: number): string;
/**
 * Get today's date in YYYY-MM-DD format.
 */
export declare function todayStr(): string;
/**
 * Get current time in HH:MM:SS format (Indonesian).
 */
export declare function nowTimeStr(): string;
