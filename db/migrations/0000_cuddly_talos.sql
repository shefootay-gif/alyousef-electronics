CREATE TABLE "activityLog" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"action" text NOT NULL,
	"entityType" text,
	"entityId" integer,
	"details" jsonb,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cartItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"sessionId" text,
	"productId" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"variantData" jsonb,
	"addedAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nameAr" text,
	"slug" text NOT NULL,
	"icon" text,
	"description" text,
	"image" text,
	"parentId" integer,
	"sortOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"productName" text NOT NULL,
	"productImage" text,
	"quantity" integer NOT NULL,
	"unitPrice" text NOT NULL,
	"totalPrice" text NOT NULL,
	"variantData" jsonb
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderNumber" text NOT NULL,
	"userId" integer,
	"guestEmail" text,
	"guestPhone" text,
	"status" text DEFAULT 'pending',
	"paymentStatus" text DEFAULT 'pending',
	"subtotal" text NOT NULL,
	"taxAmount" text DEFAULT '0',
	"shippingAmount" text DEFAULT '0',
	"discountAmount" text DEFAULT '0',
	"total" text NOT NULL,
	"shippingAddress" jsonb,
	"paymentMethod" text,
	"notes" text,
	"trackingNumber" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nameAr" text,
	"slug" text NOT NULL,
	"description" text,
	"descriptionAr" text,
	"shortDescription" text,
	"categoryId" integer NOT NULL,
	"brand" text,
	"sku" text,
	"price" text NOT NULL,
	"salePrice" text,
	"costPrice" text,
	"image" text,
	"images" jsonb,
	"stockQuantity" integer DEFAULT 0,
	"lowStockThreshold" integer DEFAULT 5,
	"trackInventory" boolean DEFAULT true,
	"variants" jsonb,
	"metaTitle" text,
	"metaDescription" text,
	"status" text DEFAULT 'draft',
	"isFeatured" boolean DEFAULT false,
	"averageRating" text DEFAULT '0',
	"reviewCount" integer DEFAULT 0,
	"weight" text,
	"dimensions" jsonb,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"userId" integer,
	"userName" text,
	"userAvatar" text,
	"rating" integer NOT NULL,
	"title" text,
	"comment" text,
	"isVerified" boolean DEFAULT false,
	"helpful" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "siteSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "siteSettings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"unionId" text NOT NULL,
	"name" text,
	"email" text,
	"passwordHash" text,
	"avatar" text,
	"role" text DEFAULT 'user' NOT NULL,
	"phone" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignInAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_unionId_unique" UNIQUE("unionId")
);
--> statement-breakpoint
CREATE TABLE "wishlistItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "activityLog" ADD CONSTRAINT "activityLog_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlistItems" ADD CONSTRAINT "wishlistItems_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlistItems" ADD CONSTRAINT "wishlistItems_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "order_number_idx" ON "orders" USING btree ("orderNumber");--> statement-breakpoint
CREATE INDEX "order_user_id_idx" ON "orders" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "product_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_category_idx" ON "products" USING btree ("categoryId");