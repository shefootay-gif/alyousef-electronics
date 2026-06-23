CREATE TABLE "apiKeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"provider" text DEFAULT 'custom',
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now(),
	"lastUsedAt" timestamp,
	CONSTRAINT "apiKeys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "couponRedemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"couponId" integer NOT NULL,
	"orderId" integer NOT NULL,
	"userId" integer,
	"discountAmount" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"minSubtotal" text DEFAULT '0',
	"maxDiscount" text,
	"usageLimit" integer,
	"usedCount" integer DEFAULT 0,
	"startsAt" timestamp,
	"expiresAt" timestamp,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoiceNumber" text NOT NULL,
	"orderId" integer NOT NULL,
	"subtotal" text NOT NULL,
	"taxAmount" text DEFAULT '0',
	"shippingAmount" text DEFAULT '0',
	"discountAmount" text DEFAULT '0',
	"total" text NOT NULL,
	"currency" text DEFAULT 'EGP' NOT NULL,
	"issuedAt" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
);
--> statement-breakpoint
CREATE TABLE "paymentTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"provider" text NOT NULL,
	"providerReference" text,
	"amount" text NOT NULL,
	"currency" text DEFAULT 'EGP' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"rawPayload" jsonb,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shippingRates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"price" text NOT NULL,
	"freeShippingThreshold" text,
	"estimatedDaysMin" integer DEFAULT 1,
	"estimatedDaysMax" integer DEFAULT 5,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "crossSellIds" jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "upsellProductId" integer;--> statement-breakpoint
ALTER TABLE "couponRedemptions" ADD CONSTRAINT "couponRedemptions_couponId_coupons_id_fk" FOREIGN KEY ("couponId") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "couponRedemptions" ADD CONSTRAINT "couponRedemptions_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "couponRedemptions" ADD CONSTRAINT "couponRedemptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paymentTransactions" ADD CONSTRAINT "paymentTransactions_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coupon_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "payment_order_idx" ON "paymentTransactions" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "payment_reference_idx" ON "paymentTransactions" USING btree ("providerReference");--> statement-breakpoint
CREATE INDEX "shipping_rate_city_idx" ON "shippingRates" USING btree ("city");