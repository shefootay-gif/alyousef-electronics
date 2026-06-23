import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  X,
  Menu,
  Link as LinkIcon,
  Tags,
  Truck,
  Users,
  CreditCard
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import BrandLogo from "@/components/BrandLogo";

export default function AdminLayout() {
  const { t, isRTL } = useLanguage();
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { siteName } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-4">{t("accessDenied")}</h1>
          <p className="text-[#94A3B8] mb-6">{t("needAdmin")}</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-[#D4AF37] text-slate-100 font-bold rounded-xl">
            {t("goHome")}
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { id: "/admin/products", label: t("products"), icon: Package },
    { id: "/admin/orders", label: t("orders"), icon: ShoppingBag },
    { id: "/admin/customers", label: "Customers", icon: Users },
    { id: "/admin/coupons", label: "Coupons", icon: Tags },
    { id: "/admin/shipping", label: "Shipping", icon: Truck },
    { id: "/admin/finance", label: "Finance", icon: CreditCard },
    { id: "/admin/apps", label: "Apps & Integrations", icon: LinkIcon },
    { id: "/admin/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 ${isRTL ? "right-0" : "left-0"} z-50 bg-[#0F172A] transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 lg:w-20"
        } overflow-hidden flex-shrink-0`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between gap-3 p-6 border-b border-white/10 h-20">
            <div className="flex items-center gap-3">
              <BrandLogo variant="mark" />
              <div className={`flex flex-col ${!sidebarOpen ? 'lg:hidden' : ''}`}>
                <span className="text-[#F8FAFC] font-bold tracking-wider truncate max-w-[140px]">{siteName}</span>
                <span className="text-xs tracking-[0.2em] text-[#D4AF37]">ADMIN</span>
              </div>
            </div>
            <button 
              className="lg:hidden text-white/50 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.id || (tab.id !== '/admin' && location.pathname.startsWith(tab.id));
              
              return (
                <Link
                  key={tab.id}
                  to={tab.id}
                  title={tab.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-slate-100 shadow-lg shadow-[#D4AF37]/20"
                      : "text-[#94A3B8] hover:bg-white/5 hover:text-slate-100"
                  } ${!sidebarOpen ? 'lg:justify-center' : ''}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`font-medium ${!sidebarOpen ? 'lg:hidden' : ''}`}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title={t("logout")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${!sidebarOpen ? 'lg:justify-center' : ''}`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium ${!sidebarOpen ? 'lg:hidden' : ''}`}>{t("logout")}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-20 bg-[#0F172A] border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <BrandLogo variant="mark" />
            <span className="text-[#F8FAFC] font-bold tracking-wider">{siteName}</span>
          </div>
          <button 
            className="text-white hover:text-[#D4AF37] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-auto bg-[#050505]">
          <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
