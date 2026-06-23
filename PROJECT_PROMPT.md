# مسودة المشروع الشاملة (Project Context & Master Prompt)

هذا الملف عبارة عن "برومت" شامل يوثق كل تفاصيل مشروع **AL-YOUSEF Electronics**، ويمكنك استخدامه مستقبلاً لإعطاء أي ذكاء اصطناعي فكرة كاملة عن المشروع قبل البدء في تعديله أو إضافة ميزات جديدة له.

---

## 📌 معلومات المشروع الأساسية (Project Overview)
- **اسم المشروع:** AL-YOUSEF Electronics (اليوسف للإلكترونيات).
- **نوع المشروع:** منصة تجارة إلكترونية متطورة (E-Commerce Web Application).
- **السوق المستهدف:** السوق المصري (Egypt).
- **العملة المعتمدة:** الجنيه المصري (EGP).
- **لغة الواجهة الرئيسية:** ثنائية اللغة (عربي / إنجليزي) مع دعم كامل للـ RTL.
- **التصميم العام:** نمط "Dark Glassmorphism" (خلفيات داكنة، زجاج شفاف، ألوان زاهية كالأزرق الداكن والذهبي).

---

## 🛠 التكنولوجيا المستخدمة (Tech Stack)
- **الواجهة الأمامية (Frontend):** 
  - React (Vite)
  - Tailwind CSS (للتصميم وتنسيق الواجهات)
  - Framer Motion (للأنيميشن والحركات التفاعلية)
  - React Router (للتنقل بين الصفحات)
- **الواجهة الخلفية (Backend):** 
  - Node.js مع إطار عمل Hono.
  - tRPC (للربط الآمن والسريع بين الـ Frontend والـ Backend بدون REST تقليدي).
- **قاعدة البيانات (Database):**
  - PostgreSQL (قاعدة بيانات علائقية).
  - Drizzle ORM (للتعامل مع قاعدة البيانات برمجياً وبناء الـ Schemas).

---

## 🚀 الميزات الرئيسية (Core Features)

### 1. واجهة المستخدم (Storefront)
- **الصفحة الرئيسية:** عرض المنتجات المميزة، الأقسام، وشرائط إعلانية (Promo Bars).
- **تصفح المنتجات:** صفحات لعرض تفاصيل المنتجات، الصور المتعددة، المراجعات والتقييمات، والمخزون.
- **عربة التسوق والدفع (Cart & Checkout):** حساب تلقائي لضريبة القيمة المضافة (15%)، ومصاريف الشحن (مجاني للطلبات فوق 5000 ج.م)، مع دعم للكوبونات.
- **Upselling & Cross-Selling:** 
  - اقتراح منتجات متعلقة (Frequently Bought Together) في صفحة المنتج.
  - اقتراحات ذكية (You Might Also Need) في سلة المشتريات.

### 2. لوحة تحكم الإدارة (Shopify-Like Admin Dashboard)
- **هيكلية متقدمة:** لوحة تحكم بـ Sidebar جانبي وصفحات مستقلة لكل قسم (Dashboard, Products, Orders, Apps, Settings).
- **إدارة المتجر:** التحكم بالمنتجات، الطلبات، والعملاء.
- **التخصيص المباشر (Theme Customizer):** تغيير اسم الموقع والألوان الرئيسية والفرعية، والتي تنعكس فوراً على واجهة المستخدم باستخدام `ThemeProvider`.
- **نظام الدروبشيبينج (Dropshipping API):** نظام Webhooks مدمج مع مفاتيح API (`apiKeys`) لاستقبال المنتجات وتحديث المخزون من منصات خارجية (مثل Zendrop و AliExpress).

### 3. الحسابات (Authentication & Users)
- تسجيل الدخول للعملاء وتتبع الطلبات (`TrackOrder.tsx`).
- نظام أذونات يفصل بين العميل العادي والمدير (Admin).

---

## 📂 هيكل المجلدات (Directory Structure)
المشروع مبني بتصميم Monorepo مبسط داخل مجلد `app/`:
- `app/db/`: يحتوي على مخططات قاعدة البيانات (`schema.ts`) وإعدادات الاتصال.
- `app/api/`: يحتوي على الخوادم، ومسارات tRPC (`product-router`, `cart-router`, `settings-router`، إلخ).
- `app/src/`: يحتوي على الواجهة الأمامية:
  - `pages/`: صفحات الموقع (Home, Cart, ProductDetail).
  - `pages/admin/`: صفحات لوحة التحكم المجزأة.
  - `components/`: المكونات القابلة لإعادة الاستخدام.
  - `hooks/`: دوال React المخصصة مثل (`useCart`, `useLanguage`).
  - `providers/`: مزودات السياق (مثل `ThemeProvider`, `trpc`).

---

## 🤖 توجيهات للذكاء الاصطناعي مستقبلاً (AI System Prompt)
*انسخ هذا النص للذكاء الاصطناعي في الجلسات القادمة:*

> "You are an expert full-stack web developer assisting with the 'AL-YOUSEF Electronics' e-commerce project.
> 
> **Context:**
> The project uses React, TailwindCSS, Framer Motion, Node.js, Hono, tRPC, PostgreSQL, and Drizzle ORM. 
> The UI strictly follows a premium 'Dark Glassmorphism' aesthetic (dark backgrounds, transparent glass cards, golden/blue accents).
> The platform is fully localized in Arabic and English (RTL/LTR). The default currency is EGP (Egyptian Pounds).
> 
> **Important Rules:**
> 1. Always write responses, explanations, and commit messages in Arabic.
> 2. Ensure any new UI components strictly match the existing Dark Glassmorphism design and use Tailwind classes.
> 3. Use `tRPC` for all new backend routes. Do not use standard REST unless explicitly required for external webhooks (like dropshipping).
> 4. Any currency values must be formatted using the `formatCurrency()` function from `@/lib/utils` to maintain EGP standards.
> 5. The admin dashboard is modularized under `/app/src/pages/admin/` with an `AdminLayout.tsx`. Do not put monolithic code back into `Admin.tsx`."
