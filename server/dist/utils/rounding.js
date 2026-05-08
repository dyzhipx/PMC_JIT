/**
 * Apply rounding rules matching the frontend PMCStore logic.
 */
export function applyRounding(value, rounding) {
    if (rounding === "ceiling")
        return Math.ceil(value);
    if (rounding === "2decimal")
        return Math.round(value * 100) / 100;
    if (rounding === "3decimal")
        return Math.round(value * 1000) / 1000;
    if (rounding === "4decimal")
        return Math.round(value * 10000) / 10000;
    return value;
}
