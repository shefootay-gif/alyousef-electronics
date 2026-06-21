import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
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
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
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
  returned: "bg-gray-100 text-gray-700",
  refunded: "bg-gray-100 text-gray-700",
};

function DashboardOverview() {
  const { t, isRTL } = useLanguage();
  const { data: dashboard } = trpc.analytics.dashboard.useQuery({ period: "30d" });
  const { data: revenueData } = trpc.analytics.revenue.useQuery({ period: "30d" });
  const { data: recentOrders } = trpc.analytics.recentOrders.useQuery();

  const chartData = revenueData?.labels.map((label: string, i: number) => ({
    date: label.slice(5),
    revenue: revenueData.data[i],
  })) || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("revenue30d"), value: `SAR ${(dashboard?.revenue || 0).toFixed(0)}`, icon: <DollarSign className="w-6 h-6" />, color: "from-[#D4AF37] to-[#B8960F]" },
          { label: t("totalOrders"), value: dashboard?.totalOrders || 0, icon: <ShoppingBag className="w-6 h-6" />, color: "from-[#00D4FF] to-[#0099CC]" },
          { label: t("activeProducts"), value: dashboard?.activeProducts || 0, icon: <Package className="w-6 h-6" />, color: "from-emerald-500 to-emerald-600" },
          { label: t("newCustomers"), value: dashboard?.newCustomers || 0, icon: <Users className="w-6 h-6" />, color: "from-purple-500 to-purple-600" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}>
                {card.icon}
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-[#1A2A44]">{card.value}</p>
            <p className="text-sm text-[#94A3B8] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-[#1A2A44] mb-4">{t("revenueOverview")}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                formatter={(value: number) => [`SAR ${value.toFixed(2)}`, "Revenue"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-[#1A2A44] mb-4">{t("recentOrders")}</h3>
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("orderNumber")}</th>
                <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("status")}</th>
                <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("payment")}</th>
                <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("total")}</th>
                <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {recentOrders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${orderStatusColors[order.status] || ""}`}>
                      {t(order.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 capitalize">{order.paymentMethod?.replace("_", " ") || "N/A"}</td>
                  <td className="py-3 px-4 font-semibold text-[#D4AF37]">SAR {Number(order.total).toFixed(2)}</td>
                  <td className="py-3 px-4 text-[#94A3B8]">
                    {new Date(order.createdAt).toLocaleDateString()}
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
  });

  const toggleStatusMutation = trpc.product.toggleStatus.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      toast.success("Status updated");
    },
  });

  const [formData, setFormData] = useState({
    name: "", slug: "", description: "", shortDescription: "",
    categoryId: 1, brand: "", sku: "", price: "", salePrice: "",
    image: "", stockQuantity: 0, status: "draft" as const, isFeatured: false,
  });

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      setShowForm(false);
      setFormData({ name: "", slug: "", description: "", shortDescription: "", categoryId: 1, brand: "", sku: "", price: "", salePrice: "", image: "", stockQuantity: 0, status: "draft", isFeatured: false });
      toast.success("Product created");
    },
  });

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      setShowForm(false);
      setEditingProduct(null);
      toast.success("Product updated");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...formData, salePrice: formData.salePrice || undefined });
    } else {
      createMutation.mutate({ ...formData, salePrice: formData.salePrice || undefined });
    }
  };

  const startEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
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
            className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#D4AF37]`}
          />
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: "", slug: "", description: "", shortDescription: "", categoryId: 1, brand: "", sku: "", price: "", salePrice: "", image: "", stockQuantity: 0, status: "draft", isFeatured: false });
            setShowForm(true);
          }}
          className={`${isRTL ? "mr-4" : "ml-4"} px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#1A2A44] font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-sm`}
        >
          <Plus className="w-4 h-4" />
          {t("addProduct")}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1A2A44]">
              {editingProduct ? t("editProduct") : t("addNewProduct")}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingProduct(null); }}>
              <X className="w-5 h-5 text-[#64748B]" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("nameTitle")}</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("slugTitle")}</label>
              <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("categoryTitle")}</label>
              <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]">
                {categories?.map((cat) => <option key={cat.id} value={cat.id}>{lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("brand")}</label>
              <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("priceTitle")}</label>
              <input type="text" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" required placeholder="4599.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("salePriceTitle")}</label>
              <input type="text" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" placeholder="4299.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("sku")}</label>
              <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("stockQuantity")}</label>
              <input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("imageUrl")}</label>
              <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" placeholder="/products/image.png" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("shortDesc")}</label>
              <input type="text" value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("fullDesc")}</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF] resize-none" rows={3} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="rounded border-[#E2E8F0] text-[#D4AF37]" />
                <span className="text-sm text-[#1A2A44]">{t("featured")}</span>
              </label>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#1A2A44] font-bold rounded-xl hover:shadow-lg transition-all">
                {editingProduct ? t("updateProduct") : t("createProduct")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("product")}</th>
                <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("priceCol")}</th>
                <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("stock")}</th>
                <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("status")}</th>
                <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-4 bg-[#E2E8F0] rounded w-3/4" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-[#E2E8F0] rounded w-1/2" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-[#E2E8F0] rounded w-1/3" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-[#E2E8F0] rounded w-1/2" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-[#E2E8F0] rounded w-1/3" /></td>
                  </tr>
                ))
              ) : productsData?.items?.map((product: any) => (
                <tr key={product.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image || "/placeholder.png"} alt={product.name} className="w-10 h-10 object-contain rounded-lg bg-[#F8FAFC]" />
                      <div>
                        <p className="font-medium text-[#1A2A44] line-clamp-1">{product.name}</p>
                        <p className="text-xs text-[#94A3B8]">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#D4AF37]">SAR {product.salePrice || product.price}</span>
                    {product.salePrice && <span className="text-xs text-[#94A3B8] line-through ml-1">SAR {product.price}</span>}
                  </td>
                  <td className="py-3 px-4">{product.stockQuantity}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[product.status] || ""}`}>
                      {t(product.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(product)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#D4AF37] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate({ id: product.id }); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-[#64748B] hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleStatusMutation.mutate({ id: product.id, status: product.status === "active" ? "inactive" : "active" })} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#00D4FF] transition-colors">
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("orderNumber")}</th>
              <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("customer")}</th>
              <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("total")}</th>
              <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("status")}</th>
              <th className="py-3 px-4 font-semibold text-[#1A2A44]">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {ordersData?.items?.map((order: any) => (
              <tr key={order.id} className="hover:bg-[#F8FAFC]">
                <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-[#1A2A44]">
                    {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                  </div>
                  <div className="text-xs text-[#64748B] mt-1 space-y-0.5">
                    <p>{order.shippingAddress?.phone}</p>
                    <p>{order.shippingAddress?.district}, {order.shippingAddress?.city}</p>
                    <p>{order.shippingAddress?.streetAddress} {order.shippingAddress?.buildingNumber ? `- ${order.shippingAddress.buildingNumber}` : ''}</p>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-[#D4AF37]">SAR {Number(order.total).toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${orderStatusColors[order.status] || ""}`}>
                    {t(order.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value as any })}
                    className="text-xs rounded-lg border border-[#E2E8F0] px-2 py-1 focus:outline-none focus:border-[#D4AF37]"
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

  useState(() => {
    if (contactLinks) setLinks(contactLinks);
  });

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
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl">
      <h3 className="text-lg font-bold text-[#1A2A44] mb-6">{t("contactLinks")}</h3>
      <div className="space-y-4">
        {["whatsapp", "website", "snapchat", "twitter", "telegram"].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-[#1A2A44] mb-1 capitalize">{key}</label>
            <input
              type="text"
              value={links[key] || ""}
              onChange={(e) => setLinks({ ...links, [key]: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]"
              placeholder={`Enter ${key} link`}
            />
          </div>
        ))}
        <button onClick={handleSave} className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#1A2A44] font-bold rounded-xl hover:shadow-lg transition-all">
          {t("saveSettings")}
        </button>
      </div>

      <div className="mt-10 border-t border-[#E2E8F0] pt-8">
        <h3 className="text-lg font-bold text-[#1A2A44] mb-6">أدوات التتبع (Pixels)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A2A44] mb-1">Facebook Pixel ID</label>
            <input type="text" value={pixels.facebookPixelId || ""} onChange={(e) => setPixels({ ...pixels, facebookPixelId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" placeholder="مثال: 123456789012345" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A2A44] mb-1">TikTok Pixel ID</label>
            <input type="text" value={pixels.tiktokPixelId || ""} onChange={(e) => setPixels({ ...pixels, tiktokPixelId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" placeholder="مثال: C1234567890" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A2A44] mb-1">Snapchat Pixel ID</label>
            <input type="text" value={pixels.snapchatPixelId || ""} onChange={(e) => setPixels({ ...pixels, snapchatPixelId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" placeholder="مثال: 12345678-1234-1234-1234-123456789012" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A2A44] mb-1">Google Analytics ID (G-XXXX)</label>
            <input type="text" value={pixels.googleAnalyticsId || ""} onChange={(e) => setPixels({ ...pixels, googleAnalyticsId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#00D4FF]" placeholder="مثال: G-ABC123XYZ" />
          </div>
          <button onClick={handleSave} className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#1A2A44] font-bold rounded-xl hover:shadow-lg transition-all">
            حفظ إعدادات التتبع
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { t, isRTL } = useLanguage();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          <button onClick={() => navigate("/")} className="px-6 py-3 bg-[#D4AF37] text-[#1A2A44] font-bold rounded-xl">
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
    <div className="min-h-screen bg-[#F1F5F9] flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 ${isRTL ? "right-0" : "left-0"} z-40 bg-[#0F172A] transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 lg:w-20"
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-3 p-6 border-b border-white/10 h-20">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1A2A44] to-[#00D4FF] flex items-center justify-center shadow-lg border border-[#D4AF37]/30">
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
                    activeTab === tab.id
                      ? `bg-white/10 text-[#D4AF37] ${isRTL ? "border-r-2" : "border-l-2"} border-[#D4AF37]`
                      : "text-[#94A3B8] hover:bg-white/5 hover:text-[#F8FAFC]"
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
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-[#64748B]">
            {sidebarOpen ? <X className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
          </button>
          <div className={`flex items-center gap-4 ${isRTL ? "mr-auto" : "ml-auto"}`}>
            <button className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
              <Bell className="w-5 h-5 text-[#64748B]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A2A44] to-[#00D4FF] flex items-center justify-center text-white font-bold text-sm">
              {(user.name || "A")[0]}
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
