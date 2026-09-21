import type { ApprovalStatus } from 'lib/productApproval';

export type StorefrontMode = 'RETAIL' | 'WHOLESALE';
export type ActiveStatus = 'ACTIVE' | 'INACTIVE';

/* ---------------- people ---------------- */

/** Matches Prisma's `User.role`, plus the two staff grades the design shows. */
export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEW_ONLY' | 'SELLER' | 'BUYER';

export const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEW_ONLY: 'View-only',
  SELLER: 'Seller',
  BUYER: 'Buyer'
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  status: ActiveStatus;
  /** ISO date. */
  joinedAt: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  /** Loyalty tier, buyers only. */
  tier: string | null;
  lastLogin: string;
  devices: string;
  card: { brand: string; last4: string; expires: string } | null;
  walletBalance: number;
  /** Set when this account owns a store. */
  storeId: string | null;
}

/* ---------------- catalogue ---------------- */

export interface AdminCategory {
  id: string;
  name: string;
  subcategories: { id: string; name: string; description: string; productCount: number }[];
}

export interface AdminBrand {
  id: string;
  name: string;
  logo: string | null;
  description: string;
  productCount: number;
  status: ActiveStatus;
  joinedAt: string;
}

/* ---------------- stores ---------------- */

export interface AdminStore {
  id: string;
  name: string;
  logo: string | null;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  address: string;
  verified: boolean;
  status: ActiveStatus;
  createdAt: string;
  /** AED. */
  sales: number;
  monthlySales: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  activeProducts: number;
  outOfStock: number;
  /** 0–1. */
  fulfilment: number;
  rating: number;
  returnRate: number;
  bank: string;
  recentPayout: number;
  pendingSettlement: number;
}

export interface StoreActivity {
  storeId: string;
  kind: 'PRODUCT' | 'PRICE' | 'SALE';
  title: string;
  detail: string;
}

export interface StoreReview {
  storeId: string;
  author: string;
  date: string;
  rating: number;
  body: string;
}

/* ---------------- products ---------------- */

export interface ProductVariation {
  name: string;
  size: string;
  colour: string;
  price: number;
  stock: number;
  createdAt: string;
  images: string[];
}

export interface AdminProduct {
  id: string;
  storeId: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  categoryId: string;
  subcategoryName: string;
  brandName: string;
  mode: StorefrontMode;
  price: number;
  discountPercent: number;
  colour: string;
  stock: number;
  sales: number;
  /** The admin's decision — see lib/productApproval. */
  approval: ApprovalStatus;
  /** Why it was rejected, shown to the seller. */
  approvalNote: string | null;
  /** The seller's own on/off switch, which an admin decision must not touch. */
  listedBySeller: boolean;
  createdAt: string;
  variations: ProductVariation[];
}

/* ---------------- orders ---------------- */

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface AdminOrder {
  id: string;
  storeId: string;
  productId: string;
  mode: StorefrontMode;
  customerName: string;
  customerEmail: string;
  items: number;
  total: number;
  discountPercent: number;
  coupon: string | null;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'REFUNDED';
  shipping: string;
  status: OrderStatus;
  /** Held back from the seller's balance while the order is unresolved. */
  freezeAmount: boolean;
  createdAt: string;
}
