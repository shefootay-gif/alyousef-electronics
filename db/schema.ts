import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

// Users table (managed by auth system, extended with role)
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  unionId: text("unionId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  passwordHash: text("passwordHash"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  phone: text("phone"),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: integer("lastSignInAt", { mode: "timestamp" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Categories table
export const categories = sqliteTable("categories", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nameAr: text("nameAr"),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  description: text("description"),
  image: text("image"),
  parentId: integer("parentId", { mode: "number" }),
  sortOrder: integer("sortOrder").default(0),
  isActive: integer("isActive", { mode: "boolean" }).default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().$onUpdate(() => new Date()),
});

export type Category = typeof categories.$inferSelect;

// Products table
export const products = sqliteTable("products", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nameAr: text("nameAr"),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  shortDescription: text("shortDescription"),
  categoryId: integer("categoryId", { mode: "number" }).references(() => categories.id).notNull(),
  brand: text("brand"),
  sku: text("sku").unique(),
  price: text("price").notNull(),
  salePrice: text("salePrice"),
  costPrice: text("costPrice"),
  image: text("image"),
  images: text("images", { mode: "json" }).$type<string[]>(),
  stockQuantity: integer("stockQuantity").default(0),
  lowStockThreshold: integer("lowStockThreshold").default(5),
  trackInventory: integer("trackInventory", { mode: "boolean" }).default(true),
  variants: text("variants", { mode: "json" }).$type<{
    name: string;
    options: { value: string; priceAdjustment: number; stock: number }[];
  }[]>(),
  metaTitle: text("metaTitle"),
  metaDescription: text("metaDescription"),
  status: text("status", { enum: ["active", "inactive", "draft", "out_of_stock"] }).default("draft"),
  isFeatured: integer("isFeatured", { mode: "boolean" }).default(false),
  averageRating: text("averageRating").default("0"),
  reviewCount: integer("reviewCount").default(0),
  weight: text("weight"),
  dimensions: text("dimensions", { mode: "json" }).$type<{ length: number; width: number; height: number }>(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;

// Cart items table
export const cartItems = sqliteTable("cartItems", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).references(() => users.id),
  sessionId: text("sessionId"),
  productId: integer("productId", { mode: "number" }).references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  variantData: text("variantData", { mode: "json" }).$type<Record<string, string>>(),
  addedAt: integer("addedAt", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().$onUpdate(() => new Date()),
});

export type CartItem = typeof cartItems.$inferSelect;

// Orders table
export const orders = sqliteTable("orders", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orderNumber: text("orderNumber").notNull().unique(),
  userId: integer("userId", { mode: "number" }).references(() => users.id),
  guestEmail: text("guestEmail"),
  guestPhone: text("guestPhone"),
  status: text("status", { enum: ["pending", "processing", "shipped", "delivered", "cancelled", "return_requested", "returned", "refunded"] }).default("pending"),
  paymentStatus: text("paymentStatus", { enum: ["pending", "paid", "failed", "refunded"] }).default("pending"),
  subtotal: text("subtotal").notNull(),
  taxAmount: text("taxAmount").default("0"),
  shippingAmount: text("shippingAmount").default("0"),
  discountAmount: text("discountAmount").default("0"),
  total: text("total").notNull(),
  shippingAddress: text("shippingAddress", { mode: "json" }).$type<{
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }>(),
  paymentMethod: text("paymentMethod", { enum: ["credit_card", "paypal", "cod", "stc_pay", "apple_pay"] }),
  notes: text("notes"),
  trackingNumber: text("trackingNumber"),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;

// Order items table
export const orderItems = sqliteTable("orderItems", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orderId: integer("orderId", { mode: "number" }).references(() => orders.id).notNull(),
  productId: integer("productId", { mode: "number" }).references(() => products.id).notNull(),
  productName: text("productName").notNull(),
  productImage: text("productImage"),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unitPrice").notNull(),
  totalPrice: text("totalPrice").notNull(),
  variantData: text("variantData", { mode: "json" }).$type<Record<string, string>>(),
});

export type OrderItem = typeof orderItems.$inferSelect;

// Reviews table
export const reviews = sqliteTable("reviews", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  productId: integer("productId", { mode: "number" }).references(() => products.id).notNull(),
  userId: integer("userId", { mode: "number" }).references(() => users.id),
  userName: text("userName"),
  userAvatar: text("userAvatar"),
  rating: integer("rating").notNull(),
  title: text("title"),
  comment: text("comment"),
  isVerified: integer("isVerified", { mode: "boolean" }).default(false),
  helpful: integer("helpful").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow(),
});

export type Review = typeof reviews.$inferSelect;
// Wishlist items table
export const wishlistItems = sqliteTable("wishlistItems", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).references(() => users.id).notNull(),
  productId: integer("productId", { mode: "number" }).references(() => products.id).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow(),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;

// Site settings table
export const siteSettings = sqliteTable("siteSettings", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value", { mode: "json" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().$onUpdate(() => new Date()),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

// Activity log table
export const activityLog = sqliteTable("activityLog", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entityType"),
  entityId: integer("entityId", { mode: "number" }),
  details: text("details", { mode: "json" }),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
