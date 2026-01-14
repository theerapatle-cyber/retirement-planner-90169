import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nfNoDecimal = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
export const nf2 = (value: number, digits = 2) =>
  new Intl.NumberFormat("th-TH", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

export const nfInput = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 });

export const formatNumber = (value: string | number) => {
  const num = typeof value === "string" ? Number(String(value).replace(/,/g, "") || 0) : value;
  return isNaN(num) ? "0" : nfNoDecimal.format(num);
};

export const formatNumber2 = (value: number, digits = 2) => {
  return isNaN(value) ? "0" : nf2(value, digits);
};

export function formatInputDisplay(v: string | number) {
  const num = typeof v === "string" ? Number(String(v).replace(/,/g, "") || 0) : v;
  return isNaN(num) ? "0" : nfInput.format(num);
}

export const round2 = (num: number) => Math.round(num * 100) / 100;

export function parseInputValue(v: string | number) {
  const num = Number(String(v || "").replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
}
