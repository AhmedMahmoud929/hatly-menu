// Add these interfaces to your existing types.ts file

import { ILocaleContent } from "@/models";

export interface ProductSize {
  name: string;
  price: number;
}

export interface ProductExtra {
  name: string;
  price: number;
}

export interface IProduct {
  _id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  price: number;
  is_available: boolean;
  total_order?: number;
  extras: ProductExtra[];
  image: string;
  sizes: ProductSize[];
}

export interface MenuItem {
  id: number | string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  tags?: string[];
  rating?: number;
  isNew?: boolean;
  isSignature?: boolean;
  currency?: string;
}
