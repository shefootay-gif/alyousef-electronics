import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "en" | "ar";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  home: { en: "Home", ar: "الرئيسية" },
  shop: { en: "Shop", ar: "المتجر" },
  categories: { en: "Categories", ar: "التصنيفات" },
  deals: { en: "Deals", ar: "العروض" },
  search: { en: "Search products...", ar: "ابحث عن منتجات..." },
  myOrders: { en: "My Orders", ar: "طلباتي" },
  adminDashboard: { en: "Admin Dashboard", ar: "لوحة التحكم" },
  aboutUs: { en: "About Us", ar: "عن المتجر" },
  returnPolicy: { en: "Return Policy", ar: "سياسة الاسترجاع" },
  logout: { en: "Logout", ar: "تسجيل الخروج" },

  // Home
  premiumElectronics: { en: "PREMIUM ELECTRONICS", ar: "إلكترونيات متميزة" },
  heroTitle: { en: "DISCOVER THE FUTURE OF TECHNOLOGY", ar: "اكتشف مستقبل التكنولوجيا" },
  heroDesc: {
    en: "Saudi Arabia's trusted destination for premium electronics. From flagship smartphones to cutting-edge laptops.",
    ar: "وجهتك الموثوقة في المملكة العربية السعودية للإلكترونيات المتميزة. من أفضل الهواتف الذكية إلى أحدث الحاسبات المحمولة.",
  },
  shopNow: { en: "SHOP NOW", ar: "تسوق الآن" },
  browseByCategory: { en: "Browse by", ar: "تصفح حسب" },
  category: { en: "Category", ar: "التصنيف" },
  featuredProducts: { en: "Featured", ar: "منتجات" },
  products: { en: "Products", ar: "مميزة" },
  viewAllProducts: { en: "View All Products", ar: "عرض جميع المنتجات" },
  limitedTimeOffer: { en: "LIMITED TIME OFFER", ar: "عرض محدود الوقت" },
  offerTitle: { en: "Get 15% OFF on All Gaming Accessories", ar: "احصل على خصم 15% على جميع ملحقات الألعاب" },
  grabDeal: { en: "GRAB THE DEAL", ar: "احصل على العرض" },
  whatCustomersSay: { en: "What Our", ar: "ماذا يقول" },
  customers: { en: "Customers", ar: "عملاؤنا" },
  say: { en: "Say", ar: "" },
  freeDelivery: { en: "Free Delivery", ar: "توصيل مجاني" },
  freeDeliveryDesc: { en: "On orders over SAR 500", ar: "على الطلبات فوق 500 ريال" },
  securePayment: { en: "Secure Payment", ar: "دفع آمن" },
  securePaymentDesc: { en: "100% secure checkout", ar: "دفع آمن 100%" },
  support: { en: "24/7 Support", ar: "دعم 24/7" },
  supportDesc: { en: "Always here to help", ar: "دائماً في خدمتك" },
  easyReturns: { en: "Easy Returns", ar: "إرجاع سهل" },
  easyReturnsDesc: { en: "30-day return policy", ar: "سياسة إرجاع 30 يوم" },
  days: { en: "Days", ar: "أيام" },
  hours: { en: "Hours", ar: "ساعات" },
  min: { en: "Min", ar: "دقيقة" },
  sec: { en: "Sec", ar: "ثانية" },

  // Shop
  filters: { en: "Filters", ar: "الفلاتر" },
  allCategories: { en: "All Categories", ar: "جميع التصنيفات" },
  brands: { en: "Brands", ar: "الماركات" },
  priceRange: { en: "Price Range", ar: "نطاق السعر" },
  resetAll: { en: "Reset All", ar: "إعادة ضبط" },
  newest: { en: "Newest", ar: "الأحدث" },
  priceLowHigh: { en: "Price: Low to High", ar: "السعر: من الأقل للأعلى" },
  priceHighLow: { en: "Price: High to Low", ar: "السعر: من الأعلى للأقل" },
  topRated: { en: "Top Rated", ar: "الأعلى تقييماً" },
  name: { en: "Name", ar: "الاسم" },
  noProductsFound: { en: "No products found", ar: "لا توجد منتجات" },
  adjustFilters: { en: "Try adjusting your filters", ar: "حاول تعديل الفلاتر" },
  previous: { en: "Previous", ar: "السابق" },
  next: { en: "Next", ar: "التالي" },

  // Product
  addToCart: { en: "Add to Cart", ar: "أضف للسلة" },
  inStock: { en: "In Stock", ar: "متوفر" },
  outOfStock: { en: "Out of Stock", ar: "نفذت الكمية" },
  description: { en: "Description", ar: "الوصف" },
  specifications: { en: "Specifications", ar: "المواصفات" },
  reviews: { en: "Reviews", ar: "التقييمات" },
  freeDeliveryLabel: { en: "Free Delivery", ar: "توصيل مجاني" },
  warrantyLabel: { en: "Warranty", ar: "الضمان" },
  returnsLabel: { en: "Returns", ar: "الإرجاع" },
  youMayAlsoLike: { en: "You May Also", ar: "قد يعجبك" },
  like: { en: "Like", ar: "أيضاً" },
  backToShop: { en: "Back to Shop", ar: "العودة للمتجر" },
  productNotFound: { en: "Product Not Found", ar: "المنتج غير موجود" },
  noReviews: { en: "No reviews yet. Be the first to review!", ar: "لا توجد تقييمات بعد. كن أول من يقيّم!" },
  saveSAR: { en: "Save SAR", ar: "وفّر ريال" },
  quantity: { en: "Quantity:", ar: "الكمية:" },
  brand: { en: "Brand", ar: "الماركة" },
  sku: { en: "SKU", ar: "رقم المنتج" },
  weight: { en: "Weight", ar: "الوزن" },
  stock: { en: "Stock", ar: "المخزون" },
  units: { en: "units", ar: "وحدة" },

  // Cart
  yourCart: { en: "Your Cart", ar: "سلتك" },
  emptyCart: { en: "Your cart is empty", ar: "سلتك فارغة" },
  continueShopping: { en: "Continue Shopping", ar: "متابعة التسوق" },
  orderSummary: { en: "Order Summary", ar: "ملخص الطلب" },
  subtotal: { en: "Subtotal", ar: "المجموع الفرعي" },
  shipping: { en: "Shipping", ar: "الشحن" },
  free: { en: "Free", ar: "مجاني" },
  total: { en: "Total", ar: "الإجمالي" },
  proceedToCheckout: { en: "Proceed to Checkout", ar: "إتمام الطلب" },

  // Login
  welcomeBack: { en: "Welcome Back", ar: "مرحباً بعودتك" },
  createAccount: { en: "Create an Account", ar: "إنشاء حساب" },
  signInAccount: { en: "Sign in to your account", ar: "سجل الدخول لحسابك" },
  signUpStart: { en: "Sign up to start shopping", ar: "سجل لتبدأ التسوق" },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  password: { en: "Password", ar: "كلمة المرور" },
  signIn: { en: "Sign In", ar: "تسجيل الدخول" },
  signUp: { en: "Sign Up", ar: "إنشاء حساب" },
  orContinueWith: { en: "Or continue with", ar: "أو تابع مع" },
  signInWithKimi: { en: "Sign in with Kimi", ar: "الدخول عبر Kimi" },
  noAccount: { en: "Don't have an account?", ar: "ليس لديك حساب؟" },
  hasAccount: { en: "Already have an account?", ar: "لديك حساب بالفعل؟" },

  // Admin Dashboard
  revenue30d: { en: "Revenue (30d)", ar: "الإيرادات (30 يوم)" },
  totalOrders: { en: "Total Orders", ar: "إجمالي الطلبات" },
  activeProducts: { en: "Active Products", ar: "المنتجات النشطة" },
  newCustomers: { en: "New Customers", ar: "عملاء جدد" },
  revenueOverview: { en: "Revenue Overview", ar: "نظرة عامة على الإيرادات" },
  recentOrders: { en: "Recent Orders", ar: "أحدث الطلبات" },
  orderNumber: { en: "Order #", ar: "رقم الطلب" },
  status: { en: "Status", ar: "الحالة" },
  payment: { en: "Payment", ar: "الدفع" },
  date: { en: "Date", ar: "التاريخ" },
  
  // Admin Products
  searchProducts: { en: "Search products...", ar: "ابحث عن منتجات..." },
  addProduct: { en: "Add Product", ar: "إضافة منتج" },
  editProduct: { en: "Edit Product", ar: "تعديل منتج" },
  addNewProduct: { en: "Add New Product", ar: "إضافة منتج جديد" },
  priceTitle: { en: "Price *", ar: "السعر *" },
  salePriceTitle: { en: "Sale Price", ar: "السعر المخفض" },
  stockQuantity: { en: "Stock Quantity", ar: "كمية المخزون" },
  imageUrl: { en: "Image URL", ar: "رابط الصورة" },
  shortDesc: { en: "Short Description", ar: "وصف قصير" },
  fullDesc: { en: "Full Description", ar: "وصف كامل" },
  featured: { en: "Featured", ar: "مميز" },
  updateProduct: { en: "Update Product", ar: "تحديث المنتج" },
  createProduct: { en: "Create Product", ar: "إنشاء منتج" },
  actions: { en: "Actions", ar: "الإجراءات" },
  product: { en: "Product", ar: "المنتج" },
  priceCol: { en: "Price", ar: "السعر" },
  nameTitle: { en: "Name *", ar: "الاسم *" },
  slugTitle: { en: "Slug *", ar: "الرابط الفرعي *" },
  categoryTitle: { en: "Category *", ar: "التصنيف *" },
  
  // Admin Orders
  customer: { en: "Customer", ar: "العميل" },
  pending: { en: "Pending", ar: "قيد الانتظار" },
  processing: { en: "Processing", ar: "جاري التجهيز" },
  shipped: { en: "Shipped", ar: "تم الشحن" },
  delivered: { en: "Delivered", ar: "تم التوصيل" },
  cancelled: { en: "Cancelled", ar: "ملغى" },
  return_requested: { en: "Return Requested", ar: "طلب استرجاع" },
  returned: { en: "Returned", ar: "مرتجع" },
  refunded: { en: "Refunded", ar: "مسترد" },
  requestReturn: { en: "Request Return", ar: "طلب استرجاع" },
  
  // Admin Settings & General
  contactLinks: { en: "Contact Links", ar: "روابط التواصل" },
  saveSettings: { en: "Save Settings", ar: "حفظ الإعدادات" },
  accessDenied: { en: "Access Denied", ar: "تم رفض الوصول" },
  needAdmin: { en: "You need admin privileges to access this page.", ar: "تحتاج إلى صلاحيات الإدارة للوصول لهذه الصفحة." },
  goHome: { en: "Go Home", ar: "العودة للرئيسية" },
  backToStore: { en: "Back to Store", ar: "العودة للمتجر" },
  dashboard: { en: "Dashboard", ar: "اللوحة الرئيسية" },
  orders: { en: "Orders", ar: "الطلبات" },
  settings: { en: "Settings", ar: "الإعدادات" },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("lang") as Lang) || "en";
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    if (lang === "ar") {
      // Load Arabic font
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap";
      link.id = "arabic-font";
      if (!document.getElementById("arabic-font")) {
        document.head.appendChild(link);
      }
      document.body.style.fontFamily = "'Tajawal', sans-serif";
    } else {
      document.body.style.fontFamily = "";
    }
  }, [lang]);

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
