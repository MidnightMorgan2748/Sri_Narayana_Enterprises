export interface CustomerInfo {
  name: string;
  mobile: string;
  email: string;
  deliveryAddress: string;
}

export type ProductType = 'paint' | 'putty' | 'cement' | 'rod';

export interface CartItem {
  id: string; // unique identifier (productType + modifier + size)
  type: ProductType;
  name: string;
  colorName?: string; // only for paint
  shadeCode?: string; // only for paint
  colorHex?: string;  // only for paint
  size: string;       // "1L", "4L", "20KG", "8mm", etc.
  quantity: number;
  price: number;
  weight?: string;    // only for rods/cement if helpful
}

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'confirmed' | 'packed' | 'dispatched' | 'delivered';
  notes?: string;
  emailSent?: boolean;
}

export interface InventoryPriceItem {
  id: string;
  name: string;
  type: ProductType;
  pricePerUnit: number;
  unitLabel: string;
  description?: string;
}

export interface AppState {
  cart: CartItem[];
  customerInfo: CustomerInfo | null;
  orders: Order[];
  paintsBasePrice: number; // default multiplier per Liter
  puttyPrices: Record<string, number>; // e.g. "White" -> price per KG multiplier
  cementPrices: Record<string, number>; // "OPC" -> bag price, etc.
  rodPrices: Record<string, number>; // "8mm" -> single bar price
}
