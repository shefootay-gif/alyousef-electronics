import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Bell,
  ChevronLeft,
  X,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, type Variants } from "framer-motion";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-white/10 text-gray-700",
  draft: "bg-yellow-100 text-yellow-700",
  out_of_stock: "bg-red-100 text-red-700",
};

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

function DashboardOverview() {
  const { t, isRTL } = useLanguage();
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

function ProductsManagement() {
  const { t, lang, isRTL } = useLanguage();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: productsData, isLoading } = trpc.product.list.useQuery({
    search: search || undefined,
    page: 1,
    limit: 50,
    status: undefined,
  });

  const { data: categories } = trpc.category.list.useQuery({ includeInactive: true });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      toast.success("Product deleted");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete product");
    }
  });

  const toggleStatusMutation = trpc.product.toggleStatus.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      toast.success("Status updated");
    },
  });

  const [formData, setFormData] = useState({
    name: "", nameAr: "", slug: "", description: "", descriptionAr: "", shortDescription: "",
    categoryId: 1, brand: "", sku: "", price: "", salePrice: "",
    image: "", stockQuantity: 0, status: "draft" as const, isFeatured: false,
  });

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      setShowForm(false);
      setFormData({ name: "", nameAr: "", slug: "", description: "", descriptionAr: "", shortDescription: "", categoryId: categories?.[0]?.id || 1, brand: "", sku: "", price: "", salePrice: "", image: "", stockQuantity: 0, status: "draft", isFeatured: false });
      toast.success("Product created");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create product");
    }
  });

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      setShowForm(false);
      setEditingProduct(null);
      toast.success("Product updated");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update product");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...formData, salePrice: formData.salePrice || null });
    } else {
      createMutation.mutate({ ...formData, salePrice: formData.salePrice || null });
    }
  };

  const startEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      nameAr: product.nameAr || "",
      slug: product.slug || "",
      description: product.description || "",
      descriptionAr: product.descriptionAr || "",
      shortDescription: product.shortDescription || "",
      categoryId: product.categoryId || 1,
      brand: product.brand || "",
      sku: product.sku || "",
      price: product.price || "",
      salePrice: product.salePrice || "",
      image: product.image || "",
      stockQuantity: product.stockQuantity || 0,
      status: product.status || "draft",
      isFeatured: product.isFeatured || false,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]`} />
          <input
            type="text"
            placeholder={t("searchProducts")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]`}
          />
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: "", nameAr: "", slug: "", description: "", descriptionAr: "", shortDescription: "", categoryId: categories?.[0]?.id || 1, brand: "", sku: "", price: "", salePrice: "", image: "", stockQuantity: 0, status: "draft", isFeatured: false });
            setShowForm(true);
          }}
          className={`${isRTL ? "mr-4" : "ml-4"} px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-slate-100 font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-sm`}
        >
          <Plus className="w-4 h-4" />
          {t("addProduct")}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-100">
              {editingProduct ? t("editProduct") : t("addNewProduct")}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingProduct(null); }}>
              <X className="w-5 h-5 text-[#94A3B8]" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("nameTitle")}</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("nameArTitle")}</label>
              <input type="text" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("slugTitle")}</label>
              <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("categoryTitle")}</label>
              <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]">
                {categories?.map((cat) => <option key={cat.id} value={cat.id}>{lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("brand")}</label>
              <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("priceTitle")}</label>
              <input type="text" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" required placeholder="4599.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("salePriceTitle")}</label>
              <input type="text" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="4299.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("sku")}</label>
              <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("stockQuantity")}</label>
              <input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("imageUrl")}</label>
              <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="/products/image.png" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("shortDesc")}</label>
              <input type="text" value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("fullDesc")}</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37] resize-none" rows={3} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-100 mb-1">{t("descArTitle")}</label>
              <textarea value={formData.descriptionAr} onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37] resize-none" rows={3} dir="rtl" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="rounded border-white/10 text-[#D4AF37]" />
                <span className="text-sm text-slate-100">{t("featured")}</span>
              </label>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-slate-100 font-bold rounded-xl hover:shadow-lg transition-all">
                {editingProduct ? t("updateProduct") : t("createProduct")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-3 px-4 font-semibold text-slate-100">{t("product")}</th>
                <th className="py-3 px-4 font-semibold text-slate-100">{t("priceCol")}</th>
                <th className="py-3 px-4 font-semibold text-slate-100">{t("stock")}</th>
                <th className="py-3 px-4 font-semibold text-slate-100">{t("status")}</th>
                <th className="py-3 px-4 font-semibold text-slate-100">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-4 bg-white/10 rounded w-3/4" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-white/10 rounded w-1/2" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-white/10 rounded w-1/3" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-white/10 rounded w-1/2" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-white/10 rounded w-1/3" /></td>
                  </tr>
                ))
              ) : productsData?.items?.map((product: any) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image || "/placeholder.png"} alt={product.name} className="w-10 h-10 object-contain rounded-lg bg-white/5" />
                      <div>
                        <p className="font-medium text-slate-100 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-[#94A3B8]">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#D4AF37]">{formatCurrency(product.salePrice || product.price, lang)}</span>
                    {product.salePrice && <span className="text-xs text-[#94A3B8] line-through ml-1">{formatCurrency(product.price, lang)}</span>}
                  </td>
                  <td className="py-3 px-4">{product.stockQuantity}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[product.status] || ""}`}>
                      {t(product.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(product)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#D4AF37] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate({ id: product.id }); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleStatusMutation.mutate({ id: product.id, status: product.status === "active" ? "inactive" : "active" })} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#C0C0C0] transition-colors">
                        {product.status === "active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrdersManagement() {
  const { t, isRTL } = useLanguage();
  const { data: ordersData } = trpc.order.list.useQuery({ page: 1, limit: 50 });
  const utils = trpc.useUtils();

  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
      toast.success("Order status updated");
    },
  });

  return (
    <div className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-3 px-4 font-semibold text-slate-100">{t("orderNumber")}</th>
              <th className="py-3 px-4 font-semibold text-slate-100">{t("customer")}</th>
              <th className="py-3 px-4 font-semibold text-slate-100">{t("total")}</th>
              <th className="py-3 px-4 font-semibold text-slate-100">{t("status")}</th>
              <th className="py-3 px-4 font-semibold text-slate-100">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {ordersData?.items?.map((order: any) => (
              <tr key={order.id} className="hover:bg-white/5">
                <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-100">
                    {typeof order.shippingAddress === 'object' && order.shippingAddress !== null ? (
                      <>
                        {order.shippingAddress.firstName || order.shippingAddress.fullName} {order.shippingAddress.lastName || ''}
                      </>
                    ) : 'Guest'}
                  </div>
                  {typeof order.shippingAddress === 'object' && order.shippingAddress !== null && (
                    <div className="text-xs text-[#94A3B8] mt-1 space-y-0.5">
                      <p>{order.shippingAddress.phone}</p>
                      <p>{order.shippingAddress.district || ''}{order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}</p>
                      <p>{order.shippingAddress.streetAddress || order.shippingAddress.address || ''} {order.shippingAddress.buildingNumber ? `- ${order.shippingAddress.buildingNumber}` : ''}</p>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 font-semibold text-[#D4AF37]">{formatCurrency(Number(order.total), lang)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${orderStatusColors[order.status] || ""}`}>
                    {t(order.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value as any })}
                    className="text-xs rounded-lg border border-white/10 px-2 py-1 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="pending">{t("pending")}</option>
                    <option value="processing">{t("processing")}</option>
                    <option value="shipped">{t("shipped")}</option>
                    <option value="delivered">{t("delivered")}</option>
                    <option value="cancelled">{t("cancelled")}</option>
                    <option value="return_requested">{t("return_requested")}</option>
                    <option value="returned">{t("returned")}</option>
                    <option value="refunded">{t("refunded")}</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsPage() {
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  const { data: contactLinks } = trpc.settings.getContactLinks.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();
  const [links, setLinks] = useState<any>({});
  const [pixels, setPixels] = useState<any>({});

  useEffect(() => {
    if (contactLinks) setLinks(contactLinks);
  }, [contactLinks]);

  useEffect(() => {
    if (settings?.trackingPixels) setPixels(settings.trackingPixels);
  }, [settings]);

  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.getContactLinks.invalidate();
      toast.success("Settings saved");
    },
  });

  const handleSave = () => {
    updateSettings.mutate({ key: "contactLinks", value: links });
    updateSettings.mutate({ key: "trackingPixels", value: pixels });
  };

  return (
    <div className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 max-w-2xl">
      <h3 className="text-lg font-bold text-slate-100 mb-6">{t("contactLinks")}</h3>
      <div className="space-y-4">
        {["whatsapp", "website", "snapchat", "twitter", "telegram"].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-100 mb-1 capitalize">{key}</label>
            <input
              type="text"
              value={links[key] || ""}
              onChange={(e) => setLinks({ ...links, [key]: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]"
              placeholder={`Enter ${key} link`}
            />
          </div>
        ))}
        <button onClick={handleSave} className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-slate-100 font-bold rounded-xl hover:shadow-lg transition-all">
          {t("saveSettings")}
        </button>
      </div>

      <div className="mt-10 border-t border-white/10 pt-8">
        <h3 className="text-lg font-bold text-slate-100 mb-6">أدوات التتبع (Pixels)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1">Facebook Pixel ID</label>
            <input type="text" value={pixels.facebookPixelId || ""} onChange={(e) => setPixels({ ...pixels, facebookPixelId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="مثال: 123456789012345" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1">TikTok Pixel ID</label>
            <input type="text" value={pixels.tiktokPixelId || ""} onChange={(e) => setPixels({ ...pixels, tiktokPixelId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="مثال: C1234567890" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1">Snapchat Pixel ID</label>
            <input type="text" value={pixels.snapchatPixelId || ""} onChange={(e) => setPixels({ ...pixels, snapchatPixelId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="مثال: 12345678-1234-1234-1234-123456789012" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1">Google Analytics ID (G-XXXX)</label>
            <input type="text" value={pixels.googleAnalyticsId || ""} onChange={(e) => setPixels({ ...pixels, googleAnalyticsId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="مثال: G-ABC123XYZ" />
          </div>
          <button onClick={handleSave} className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-slate-100 font-bold rounded-xl hover:shadow-lg transition-all">
            حفظ إعدادات التتبع
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { t, lang, isRTL } = useLanguage();
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { id: "products", label: t("products"), icon: Package },
    { id: "orders", label: t("orders"), icon: ShoppingBag },
    { id: "settings", label: t("settings"), icon: Settings },
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
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-3 p-6 border-b border-white/10 h-20">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#171717] to-[#C0C0C0] flex items-center justify-center shadow-lg border border-[#D4AF37]/30">
              <span className="text-[#D4AF37] font-bold text-lg">Y</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-white leading-none">AL-YOUSEF</span>
              <span className="text-[8px] font-bold text-[#D4AF37] tracking-widest uppercase mt-0.5">Electronics</span>
            </div>
          </div>
          <nav className="flex-1 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
                    activeTab === tab.id
                      ? `bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl/10 text-[#D4AF37] ${isRTL ? "border-r-2" : "border-l-2"} border-[#D4AF37]`
                      : "text-[#94A3B8] hover:bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl/5 hover:text-[#F8FAFC]"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-6 py-3 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
              <ChevronLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
              {sidebarOpen && <span className="text-sm">{t("backToStore")}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-[#94A3B8]">
            {sidebarOpen ? <X className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
          </button>
          <div className={`flex items-center gap-4 ${isRTL ? "mr-auto" : "ml-auto"}`}>
            <div className="relative">
              <button 
                onClick={() => {
                  const el = document.getElementById("notifications-dropdown");
                  if (el) el.classList.toggle("hidden");
                }}
                className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F1F5F9] transition-colors"
              >
                <Bell className="w-5 h-5 text-[#94A3B8]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              
              {/* Notifications Dropdown */}
              <div id="notifications-dropdown" className="hidden absolute top-12 right-0 w-80 bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 overflow-hidden z-50">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <h3 className="font-bold text-slate-100">{lang === "ar" ? "الإشعارات" : "Notifications"}</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4 text-center text-[#94A3B8] text-sm">
                    {lang === "ar" ? "لا توجد إشعارات جديدة حالياً" : "No new notifications"}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#171717] to-[#C0C0C0] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:shadow-lg transition-shadow">
                {(user.name || "A")[0]}
              </div>
              <div className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-48 bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50`}>
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-[#F1F5F9] transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === "dashboard" && <DashboardOverview />}
          {activeTab === "products" && <ProductsManagement />}
          {activeTab === "orders" && <OrdersManagement />}
          {activeTab === "settings" && <SettingsPage />}
        </div>
      </div>
    </div>
  );
}
