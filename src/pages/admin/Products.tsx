import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Search, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-white/10 text-gray-700",
  draft: "bg-yellow-100 text-yellow-700",
  out_of_stock: "bg-red-100 text-red-700",
};

export default function ProductsManagement() {
  const { t, lang, isRTL } = useLanguage();
  const label = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: productsData, isLoading } = trpc.product.list.useQuery({
    search: search || undefined,
    page: 1,
    limit: 50,
    includeInactive: true,
  });

  const { data: categories } = trpc.category.list.useQuery({ includeInactive: true });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      toast.success(label("Product deleted", "تم حذف المنتج"));
    },
    onError: (err) => {
      toast.error(err.message || label("Failed to delete product", "تعذر حذف المنتج"));
    }
  });

  const toggleStatusMutation = trpc.product.toggleStatus.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      toast.success(label("Status updated", "تم تحديث الحالة"));
    },
  });

  const [formData, setFormData] = useState({
    name: "", nameAr: "", slug: "", description: "", descriptionAr: "", shortDescription: "",
    categoryId: 1, brand: "", sku: "", price: "", salePrice: "",
    image: "", stockQuantity: 0, status: "draft" as const, isFeatured: false,
    upsellProductId: null as number | null,
    crossSellIds: [] as number[],
  });

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      setShowForm(false);
      setFormData({ name: "", nameAr: "", slug: "", description: "", descriptionAr: "", shortDescription: "", categoryId: categories?.[0]?.id || 1, brand: "", sku: "", price: "", salePrice: "", image: "", stockQuantity: 0, status: "draft", isFeatured: false, upsellProductId: null, crossSellIds: [] });
      toast.success(label("Product created", "تم إنشاء المنتج"));
    },
    onError: (err) => {
      toast.error(err.message || label("Failed to create product", "تعذر إنشاء المنتج"));
    }
  });

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      setShowForm(false);
      setEditingProduct(null);
      toast.success(label("Product updated", "تم تحديث المنتج"));
    },
    onError: (err) => {
      toast.error(err.message || label("Failed to update product", "تعذر تحديث المنتج"));
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
      upsellProductId: product.upsellProductId || null,
      crossSellIds: product.crossSellIds || [],
    });
    setShowForm(true);
  };

  const productOptions = productsData?.items?.filter((product: any) => product.id !== editingProduct?.id) || [];

  const toggleCrossSell = (productId: number) => {
    const exists = formData.crossSellIds.includes(productId);
    setFormData({
      ...formData,
      crossSellIds: exists
        ? formData.crossSellIds.filter((id) => id !== productId)
        : [...formData.crossSellIds, productId],
    });
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
            setFormData({ name: "", nameAr: "", slug: "", description: "", descriptionAr: "", shortDescription: "", categoryId: categories?.[0]?.id || 1, brand: "", sku: "", price: "", salePrice: "", image: "", stockQuantity: 0, status: "draft", isFeatured: false, upsellProductId: null, crossSellIds: [] });
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
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">{label("Upsell product", "منتج الترقية")}</label>
              <select
                value={formData.upsellProductId ?? ""}
                onChange={(e) => setFormData({ ...formData, upsellProductId: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="">{label("No upsell", "بدون منتج ترقية")}</option>
                {productOptions.map((product: any) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">{label("Cross-sell products", "منتجات مكملة")}</label>
              <div className="max-h-36 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-3 space-y-2">
                {productOptions.length === 0 && (
                  <p className="text-xs text-[#94A3B8]">
                    {label("Add more products to enable cross-selling.", "أضف منتجات أخرى لتفعيل المنتجات المكملة.")}
                  </p>
                )}
                {productOptions.map((product: any) => (
                  <label key={product.id} className="flex items-center gap-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.crossSellIds.includes(product.id)}
                      onChange={() => toggleCrossSell(product.id)}
                      className="rounded border-white/10 text-[#D4AF37]"
                    />
                    <span className="line-clamp-1">{product.name}</span>
                  </label>
                ))}
              </div>
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
                      <button onClick={() => { if (confirm(label("Delete this product?", "هل تريد حذف هذا المنتج؟"))) deleteMutation.mutate({ id: product.id }); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition-colors">
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
