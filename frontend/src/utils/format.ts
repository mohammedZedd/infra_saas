import { format as dateFnsFormat, formatDistanceToNow, parseISO } from "date-fns"

/**
 * Formats a number as a currency string.
 * @param value - The numeric amount
 * @param currency - ISO 4217 currency code (default: "USD")
 * @returns Formatted string like "$1,234.56"
 */
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formats a Date or ISO string using date-fns.
 * @param date - Date object or ISO string
 * @param formatStr - date-fns format pattern (default: "MMM d, yyyy")
 * @returns Formatted date string like "Jan 5, 2025"
 */
export function formatDate(date: Date | string, formatStr = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return dateFnsFormat(d, formatStr)
}

/**
 * Returns a relative time string like "2 hours ago" or "3 days ago".
 * @param date - Date object or ISO string
 * @returns Human-readable relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

/**
 * Formats a byte count into a human-readable size string.
 * @param bytes - Number of bytes
 * @param decimals - Decimal places (default: 1)
 * @returns String like "1.5 GB" or "256 KB"
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Truncates a string to the given length and appends "…" if needed.
 * @param text - Input string
 * @param maxLength - Maximum characters before truncation
 * @returns Truncated string
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Converts a string to a URL-safe slug.
 * @param text - Input string like "My VPC Name"
 * @returns Slugified string like "my-vpc-name"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

/**
 * Capitalizes the first character of a string.
 * @param text - Input string
 * @returns String with first letter uppercased
 */
export function capitalize(text: string): string {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1)
}

