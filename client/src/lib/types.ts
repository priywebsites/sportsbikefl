export type { Product, ProductWithDiscount, CartItem, CartItemWithProduct, User } from "@shared/schema";

export interface AuthUser {
  id: string;
  username: string;
}

export interface CartState {
  items: CartItemWithProduct[];
  total: number;
  itemCount: number;
}

export interface ProductFilters {
  category?: string;
  condition?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
}

export type SortOption = "newest" | "price-low" | "price-high" | "name";
