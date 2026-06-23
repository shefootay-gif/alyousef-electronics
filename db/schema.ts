import {
  pgTable,
  text,
  integer,
  serial,
  timestamp,
  boolean,
  jsonb,
  index
} from "drizzle-orm/pg-core";

// Users table (managed by auth system, extended with role)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: text("unionId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  passwordHash: text("passwordHash"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  phone: text("phone"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt", { mode: "date" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("nameAr"),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  description: text("description"),
  image: text("image"),
  parentId: integer("parentId"),
  sortOrder: integer("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  slugIdx: index("category_slug_idx").on(table.slug),
}));

export type Category = typeof categories.$inferSelect;

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("nameAr"),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  shortDescription: text("shortDescription"),
  categoryId: integer("categoryId").references(() => categories.id).notNull(),
  brand: text("brand"),
  sku: text("sku").unique(),
  price: text("price").notNull(),
  salePrice: text("salePrice"),
  costPrice: text("costPrice"),
  image: text("image"),
  images: jsonb("images").$type<string[]>(),
  stockQuantity: integer("stockQuantity").default(0),
  lowStockThreshold: integer("lowStockThreshold").default(5),
  trackInventory: boolean("trackInventory").default(true),
  variants: jsonb("variants").$type<{
    name: string;
    options: { value: string; priceAdjustment: number; stock: number }[];
  }[]>(),
  metaTitle: text("metaTitle"),
  metaDescription: text("metaDescription"),
  status: text("status", { enum: ["active", "inactive", "draft", "out_of_stock"] }).default("draft"),
  isFeatured: boolean("isFeatured").default(false),
  averageRating: text("averageRating").default("0"),
  reviewCount: integer("reviewCount").default(0),
  weight: text("weight"),
  dimensions: jsonb("dimensions").$type<{ length: number; width: number; height: number }>(),
  crossSellIds: jsonb("crossSellIds").$type<number[]>(),
  upsellProductId: integer("upsellProductId"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  slugIdx: index("product_slug_idx").on(table.slug),
  categoryIdx: index("product_category_idx").on(table.categoryId),
}));

export type Product = typeof products.$inferSelect;

// Cart items table
export const cartItems = pgTable("cartItems", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  sessionId: text("sessionId"),
  productId: integer("productId").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  variantData: jsonb("variantData").$type<Record<string, string>>(),
  addedAt: timestamp("addedAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().$onUpdate(() => new Date()),
});

export type CartItem = typeof cartItems.$inferSelect;

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("orderNumber").notNull().unique(),
  userId: integer("userId").references(() => users.id),
  guestEmail: text("guestEmail"),
  guestPhone: text("guestPhone"),
  status: text("status", { enum: ["pending", "processing", "shipped", "delivered", "cancelled", "return_requested", "returned", "refunded"] }).default("pending"),
  paymentStatus: text("paymentStatus", { enum: ["pending", "paid", "failed", "refunded"] }).default("pending"),
  subtotal: text("subtotal").notNull(),
  taxAmount: text("taxAmount").default("0"),
  shippingAmount: text("shippingAmount").default("0"),
  discountAmount: text("discountAmount").default("0"),
  total: text("total").notNull(),
  shippingAddress: jsonb("shippingAddress").$type<{
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone: string;
    address?: string;
    district?: string;
    streetAddress?: string;
    buildingNumber?: string;
    city: string;
    postalCode?: string;
    country: string;
  }>(),
  paymentMethod: text("paymentMethod", { enum: ["credit_card", "paypal", "cod", "stc_pay", "apple_pay", "paymob", "fawry"] }),
  notes: text("notes"),
  trackingNumber: text("trackingNumber"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  orderNumberIdx: index("order_number_idx").on(table.orderNumber),
  userIdIdx: index("order_user_id_idx").on(table.userId),
}));

export type Order = typeof orders.$inferSelect;

// Order items table
export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").references(() => orders.id).notNull(),
  productId: integer("productId").references(() => products.id).notNull(),
  productName: text("productName").notNull(),
  productImage: text("productImage"),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unitPrice").notNull(),
  totalPrice: text("totalPrice").notNull(),
  variantData: jsonb("variantData").$type<Record<string, string>>(),
});

export type OrderItem = typeof orderItems.$inferSelect;

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("productId").references(() => products.id).notNull(),
  userId: integer("userId").references(() => users.id),
  userName: text("userName"),
  userAvatar: text("userAvatar"),
  rating: integer("rating").notNull(),
  title: text("title"),
  comment: text("comment"),
  isVerified: boolean("isVerified").default(false),
  helpful: integer("helpful").default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export type Review = typeof reviews.$inferSelect;
// Wishlist items table
export const wishlistItems = pgTable("wishlistItems", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  productId: integer("productId").references(() => products.id).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;

// Site settings table
export const siteSettings = pgTable("siteSettings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().$onUpdate(() => new Date()),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

// Discount coupons table
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type", { enum: ["percentage", "fixed"] }).notNull(),
  value: text("value").notNull(),
  minSubtotal: text("minSubtotal").default("0"),
  maxDiscount: text("maxDiscount"),
  usageLimit: integer("usageLimit"),
  usedCount: integer("usedCount").default(0),
  startsAt: timestamp("startsAt", { mode: "date" }),
  expiresAt: timestamp("expiresAt", { mode: "date" }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  codeIdx: index("coupon_code_idx").on(table.code),
}));

export type Coupon = typeof coupons.$inferSelect;

export const couponRedemptions = pgTable("couponRedemptions", {
  id: serial("id").primaryKey(),
  couponId: integer("couponId").references(() => coupons.id).notNull(),
  orderId: integer("orderId").references(() => orders.id).notNull(),
  userId: integer("userId").references(() => users.id),
  discountAmount: text("discountAmount").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export type CouponRedemption = typeof couponRedemptions.$inferSelect;

// Shipping rates table
export const shippingRates = pgTable("shippingRates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city"),
  price: text("price").notNull(),
  freeShippingThreshold: text("freeShippingThreshold"),
  estimatedDaysMin: integer("estimatedDaysMin").default(1),
  estimatedDaysMax: integer("estimatedDaysMax").default(5),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  cityIdx: index("shipping_rate_city_idx").on(table.city),
}));

export type ShippingRate = typeof shippingRates.$inferSelect;

// Payment transaction ledger
export const paymentTransactions = pgTable("paymentTransactions", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").references(() => orders.id).notNull(),
  provider: text("provider", { enum: ["cod", "paymob", "fawry", "stripe", "manual"] }).notNull(),
  providerReference: text("providerReference"),
  amount: text("amount").notNull(),
  currency: text("currency").default("EGP").notNull(),
  status: text("status", { enum: ["pending", "authorized", "paid", "failed", "refunded"] }).default("pending").notNull(),
  rawPayload: jsonb("rawPayload"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  orderIdx: index("payment_order_idx").on(table.orderId),
  referenceIdx: index("payment_reference_idx").on(table.providerReference),
}));

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

// Invoice records for accounting and customer downloads
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoiceNumber").notNull().unique(),
  orderId: integer("orderId").references(() => orders.id).notNull(),
  subtotal: text("subtotal").notNull(),
  taxAmount: text("taxAmount").default("0"),
  shippingAmount: text("shippingAmount").default("0"),
  discountAmount: text("discountAmount").default("0"),
  total: text("total").notNull(),
  currency: text("currency").default("EGP").notNull(),
  issuedAt: timestamp("issuedAt", { mode: "date" }).defaultNow(),
});

export type Invoice = typeof invoices.$inferSelect;

// Activity log table
export const activityLog = pgTable("activityLog", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entityType"),
  entityId: integer("entityId"),
  details: jsonb("details"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export type ActivityLog = typeof activityLog.$inferSelect;

// API Keys table for integrations (Dropshipping, etc.)
export const apiKeys = pgTable("apiKeys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  keyHash: text("keyHash"),
  keyPrefix: text("keyPrefix"),
  provider: text("provider").default("custom"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  lastUsedAt: timestamp("lastUsedAt", { mode: "date" }),
});

export type ApiKey = typeof apiKeys.$inferSelect;
