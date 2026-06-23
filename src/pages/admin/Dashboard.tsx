import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, ArrowRight, DollarSign, Package, Settings, ShoppingBag, Sparkles, TrendingUp, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, type Variants } from "framer-motion";

const orderStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  return_requested: "bg-orange-100 text-orange-700",
  returned: "bg-white/10 text-gray-700",
  refunded: "bg-white/10 text-gray-700",
};

export default function DashboardOverview() {
  const { t, lang, isRTL } = useLanguage();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const { data: dashboard } = trpc.analytics.dashboard.useQuery({ period });
  const { data: revenueData } = trpc.analytics.revenue.useQuery({ period });
  const { data: recentOrders } = trpc.analytics.recentOrders.useQuery();
  const { data: productPerformance } = trpc.analytics.productPerformance.useQuery();

  const chartData = revenueData?.labels.map((label: string, i: number) => ({
    date: label.slice(5),
    revenue: revenueData.data[i],
  })) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header and Period Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-100">{t("dashboard")}</h2>
        <div className="flex bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-lg shadow-sm border border-white/10 p-1">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p 
                  ? "bg-[#D4AF37] text-white" 
                  : "text-[#94A3B8] hover:text-slate-100 hover:bg-white/5"
              }`}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("revenue30d"), value: formatCurrency(dashboard?.revenue || 0, lang), icon: <DollarSign className="w-6 h-6" />, color: "from-[#D4AF37] to-[#B8960F]" },
          { label: t("totalOrders"), value: dashboard?.totalOrders || 0, icon: <ShoppingBag className="w-6 h-6" />, color: "from-[#C0C0C0] to-[#0099CC]" },
          { label: t("activeProducts"), value: dashboard?.activeProducts || 0, icon: <Package className="w-6 h-6" />, color: "from-emerald-500 to-emerald-600" },
          { label: t("newCustomers"), value: dashboard?.newCustomers || 0, icon: <Users className="w-6 h-6" />, color: "from-purple-500 to-purple-600" },
        ].map((card, i) => (
          <motion.div key={i} variants={itemVariants} className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-white/10/50">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
                {card.icon}
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-100">{card.value}</p>
            <p className="text-sm text-[#94A3B8] mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Store health / صحة المتجر</h3>
              <p className="text-sm text-[#94A3B8] mt-1">مؤشرات تشغيل سريعة مثل Shopify Home.</p>
            </div>
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-black/25 border border-white/10 p-4">
              <p className="text-xs text-[#94A3B8]">Low stock</p>
              <p className="mt-2 text-2xl font-black text-white">{dashboard?.lowStockProducts?.length || 0}</p>
            </div>
            <div className="rounded-xl bg-black/25 border border-white/10 p-4">
              <p className="text-xs text-[#94A3B8]">Active catalog</p>
              <p className="mt-2 text-2xl font-black text-white">{dashboard?.activeProducts || 0}</p>
            </div>
            <div className="rounded-xl bg-black/25 border border-white/10 p-4">
              <p className="text-xs text-[#94A3B8]">Orders period</p>
              <p className="mt-2 text-2xl font-black text-white">{dashboard?.totalOrders || 0}</p>
            </div>
          </div>
          {(dashboard?.lowStockProducts?.length || 0) > 0 && (
            <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-yellow-300">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-bold">منتجات تحتاج إعادة تخزين</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {dashboard?.lowStockProducts?.slice(0, 4).map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg bg-black/25 px-3 py-2 text-sm">
                    <span className="line-clamp-1 text-slate-200">{product.name}</span>
                    <span className="font-bold text-yellow-300">{product.stockQuantity ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-100">Quick actions</h3>
          <div className="mt-5 space-y-3">
            {[
              { to: "/admin/products", label: "Add or edit products", icon: Package },
              { to: "/admin/apps", label: "Connect dropshipping", icon: Sparkles },
              { to: "/admin/settings", label: "Customize theme", icon: Settings },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-[#D4AF37]/60 hover:text-[#D4AF37]"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div variants={itemVariants} className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/10/50">
        <h3 className="text-lg font-bold text-slate-100 mb-4">{t("revenueOverview")}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatCurrency(val, lang)} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                formatter={(value: number) => [formatCurrency(value, lang), "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div variants={itemVariants} className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/10/50">
          <h3 className="text-lg font-bold text-slate-100 mb-4">{t("recentOrders")}</h3>
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 font-semibold text-slate-100">{t("orderNumber")}</th>
                  <th className="py-3 px-4 font-semibold text-slate-100">{t("status")}</th>
                  <th className="py-3 px-4 font-semibold text-slate-100">{t("total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentOrders?.slice(0, 5).map((order: any) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${orderStatusColors[order.status] || ""}`}>
                        {t(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#D4AF37]">{formatCurrency(Number(order.total), lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Selling Products */}
        <motion.div variants={itemVariants} className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/10/50">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Top Selling Products / الأكثر مبيعاً</h3>
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 font-semibold text-slate-100">Product</th>
                  <th className="py-3 px-4 font-semibold text-slate-100">Sold</th>
                  <th className="py-3 px-4 font-semibold text-slate-100">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {productPerformance?.topSelling?.slice(0, 5).map((item: any) => (
                  <tr key={item.productId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-medium line-clamp-1 max-w-[150px]" title={item.productName}>{item.productName}</td>
                    <td className="py-3 px-4 text-[#0099CC] font-bold">{item.totalSold}</td>
                    <td className="py-3 px-4 font-semibold text-[#D4AF37]">{formatCurrency(Number(item.revenue || 0), lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
