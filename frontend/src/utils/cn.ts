import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes without conflicts.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 *
 * @param inputs - Any number of class values: strings, objects, arrays
 * @returns A clean, deduplicated Tailwind class string
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-indigo-600", "px-8")
 * // => "py-2 bg-indigo-600 px-8"  (px-4 overridden by px-8)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

