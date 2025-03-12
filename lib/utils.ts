import { Locale } from "@/i18n/routing";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCategoryId = (title: string) =>
  title.toLowerCase().replace(/\s/g, "-");

export const getLocaleContent = (
  locale: Locale,
  enContent: string,
  arContent: string
) => {
  return locale === "ar" ? arContent : enContent;
};
