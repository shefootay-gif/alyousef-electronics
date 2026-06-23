import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, lang: 'en' | 'ar') {
  const value = Number(amount);
  if (lang === 'ar') {
    return `${value.toLocaleString('ar-EG')} ج.م`;
  }
  return `EGP ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}
