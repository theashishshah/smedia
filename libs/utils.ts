// /lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes conditionally without conflicts.
 * Usage: cn("px-2", condition && "px-4")
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


