// Small formatting helpers used across the listings screen.

const MONTHS_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

/** Format an ISO date (YYYY-MM-DD) as "15 Jul 2026". Returns "" on invalid input. */
export function formatAvailableDate(iso: string): string {
    const parts = iso.split("-").map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return "";
    const [year, month, day] = parts;
    if (month < 1 || month > 12) return "";
    return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
}

/** Days from today until the available date (0 if today or in the past). */
export function daysUntilAvailable(iso: string): number {
    const parts = iso.split("-").map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return 0;
    const target = new Date(parts[0], parts[1] - 1, parts[2]).getTime();
    const now = new Date();
    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
    ).getTime();
    const diffMs = target - today;
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}
