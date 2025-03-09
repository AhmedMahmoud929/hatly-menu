export interface IProduct {
  _id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  price: number;
  is_available: boolean;
  total_order: number;
  extras: string[];
  image: string;
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
