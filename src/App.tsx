import { Routes, Route, useLocation } from "react-router";
import { Suspense } from "react";
import { CartProvider } from "./hooks/useCart";
import TrackingPixels from "./components/TrackingPixels";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AnimatePresence } from "framer-motion";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminSettings from "./pages/admin/Settings";
import AdminApps from "./pages/admin/Apps";
import AdminCoupons from "./pages/admin/Coupons";
import AdminShipping from "./pages/admin/Shipping";
import AdminCustomers from "./pages/admin/Customers";
import AdminFinance from "./pages/admin/Finance";
import About from "./pages/About";
import ReturnPolicy from "./pages/ReturnPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import TrackOrder from "./pages/TrackOrder";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

function LoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C0C0C0] border-t-transparent"></div>
        <p className="text-[#F8FAFC] font-semibold tracking-widest text-sm animate-pulse">LOADING...</p>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/about" element={<About />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="apps" element={<AdminApps />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="shipping" element={<AdminShipping />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="finance" element={<AdminFinance />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

import { ThemeProvider } from "./providers/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
      <TrackingPixels />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatedRoutes />
        </Suspense>
      </ErrorBoundary>
      </CartProvider>
    </ThemeProvider>
  );
}
