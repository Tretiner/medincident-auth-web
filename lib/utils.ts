import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}