import { useState } from "react";
import { useGetProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { FranchiseLayout } from "@/components/layout";
import { Button, Input, Label, Spinner } from "@/components/ui-elements";
import { Plus, X, Package, ChevronLeft, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// ─── In-app delete confirmation modal ─────────────────────────────────────
function DeleteProductModal({
  productName,
  onConfirm,
  onCancel,
  isLoading,
}: {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 p-6 flex flex-col gap-6">
        <div>
          <p className="font-display tracking-widest text-sm uppercase mb-2">Удалить товар?</p>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            «{productName}» будет удалён из каталога. Это действие необратимо.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-white text-[11px] font-display tracking-widest uppercase transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-red-600 text-white text-[11px] font-display tracking-widest uppercase hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}

type FormData = {
  name: string;
  description: string;
  price: string;
  collection: string;
  stockQuantity: string;
  discount: string;
  imageUrls: string[];
  selectedSizes: string[];
  customSize: string;
};

const emptyForm = (): FormData => ({
  name: "",
  description: "",
  price: "",
  collection: "",
  stockQuantity: "0",
  discount: "",
  imageUrls: [],
  selectedSizes: ["XS", "S", "M", "L"],
  customSize: "",
});

function productToForm(p: any): FormData {
  let urls: string[] = [];
  if (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) {
    urls = p.imageUrls;
  } else if (p.imageUrl) {
    urls = [p.imageUrl];
  }
  return {
    name: p.name || "",
    description: p.description || "",
    price: p.price ? String(p.price) : "",
    collection: p.collection || "",
    stockQuantity: String(p.stockQuantity ?? 0),
    discount: p.discount != null ? String(p.discount) : "",
    imageUrls: urls,
    selectedSizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ["XS", "S", "M", "L"],
    customSize: "",
  };
}

export default function FranchiseProducts() {
  const { data: products, isLoading } = useGetProducts({
    query: { refetchInterval: 10000 }
  });
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const createProductMut = useCreateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        setSaveError("");
        setMode("list");
        setForm(emptyForm());
      },
      onError: (err: any) => {
        setSaveError(err?.data?.error || err?.message || "Не удалось сохранить товар");
      },
    }
  });

  const updateProductMut = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        setSaveError("");
        setMode("list");
        setEditingId(null);
        setForm(emptyForm());
      },
      onError: (err: any) => {
        setSaveError(err?.data?.error || err?.message || "Не удалось сохранить товар");
      },
    }
  });

  const deleteProductMut = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        setMode("list");
        setEditingId(null);
        setForm(emptyForm());
        setShowDeleteConfirm(false);
      }
    }
  });

  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [saveError, setSaveError] = useState("");

  function setField<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function openCreate() {
    setForm(emptyForm());
    setEditingId(null);
    setNewImageUrl("");
    setSaveError("");
    setMode("create");
  }

  function openEdit(product: any) {
    setForm(productToForm(product));
    setEditingId(product.id);
    setNewImageUrl("");
    setSaveError("");
    setMode("edit");
  }

  function closeForm() {
    setMode("list");
    setEditingId(null);
    setNewImageUrl("");
    setSaveError("");
    setForm(emptyForm());
  }

  const toggleSize = (sz: string) => {
    setField("selectedSizes",
      form.selectedSizes.includes(sz)
        ? form.selectedSizes.filter(s => s !== sz)
        : [...form.selectedSizes, sz]
    );
  };

  const addCustomSize = () => {
    const sz = form.customSize.trim().toUpperCase();
    if (sz && !form.selectedSizes.includes(sz)) {
      setField("selectedSizes", [...form.selectedSizes, sz]);
      setField("customSize", "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(form.price);
    if (!form.name.trim() || isNaN(parsedPrice)) {
      alert("Заполните обязательные поля: название и цена");
      return;
    }
    const imageUrls = form.imageUrls.filter(Boolean);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parsedPrice,
      collection: form.collection.trim(),
      stockQuantity: parseInt(form.stockQuantity) || 0,
      discount: form.discount ? parseFloat(form.discount) : null,
      imageUrl: imageUrls[0] || "",
      imageUrls,
      sizes: form.selectedSizes.length > 0 ? form.selectedSizes : ["XS", "S", "M", "L"],
    };

    if (mode === "edit" && editingId !== null) {
      updateProductMut.mutate({ id: editingId, data: payload });
    } else {
      createProductMut.mutate({ data: payload });
    }
  };

  const isSaving = createProductMut.isPending || updateProductMut.isPending;
  const isEdit = mode === "edit";

  return (
    <FranchiseLayout>
      {/* List view */}
      {mode === "list" && (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display tracking-[0.2em] uppercase">{t("products")}</h1>
              <p className="text-zinc-500 text-xs font-display tracking-widest mt-1">{products?.length || 0} items</p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              {t("add_product")}
            </Button>
          </div>

          {isLoading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products?.map(product => (
                <div
                  key={product.id}
                  className="border border-zinc-800 bg-zinc-950 flex flex-col cursor-pointer hover:border-zinc-600 transition-colors"
                  onClick={() => openEdit(product)}
                >
                  <div className="aspect-[4/3] bg-zinc-900 overflow-hidden">
                    <img
                      src={product.imageUrl || `${import.meta.env.BASE_URL}images/product-placeholder.png`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display tracking-widest text-sm uppercase leading-tight">{product.name}</h3>
                      <span className={`shrink-0 text-[9px] font-display tracking-widest px-2 py-0.5 ${
                        product.type === "in_stock"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-900"
                          : "border border-zinc-700 text-zinc-500"
                      }`}>
                        {product.type === "in_stock" ? t("in_stock") : t("preorder")}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs font-sans line-clamp-1">{product.collection || "—"}</p>
                    <div className="flex items-baseline gap-3 mt-auto pt-2">
                      {product.discount ? (
                        <>
                          <span className="text-zinc-600 line-through text-xs">{formatPrice(product.price)}</span>
                          <span className="text-white text-sm font-display">{formatPrice(product.price * (1 - product.discount / 100))}</span>
                          <span className="text-[10px] text-amber-400 font-display">-{product.discount}%</span>
                        </>
                      ) : (
                        <span className="text-sm font-display">{formatPrice(product.price)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex gap-1 flex-wrap">
                        {product.sizes?.slice(0, 4).map(s => (
                          <span key={s} className="text-[9px] font-display border border-zinc-800 px-1.5 py-0.5 text-zinc-500">{s}</span>
                        ))}
                        {(product.sizes?.length ?? 0) > 4 && (
                          <span className="text-[9px] font-display text-zinc-600">+{(product.sizes?.length ?? 0) - 4}</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-display tracking-widest ${
                        product.type === "in_stock" ? "text-emerald-500" : "text-zinc-500"
                      }`}>
                        {product.type === "in_stock"
                          ? `${t("in_stock")} · ${product.stockQuantity}`
                          : t("preorder")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && products?.length === 0 && (
            <div className="border border-zinc-800 p-20 flex flex-col items-center text-center">
              <Package className="w-12 h-12 text-zinc-700 mb-4" strokeWidth={1} />
              <p className="font-display tracking-widest text-zinc-500 uppercase text-sm">Нет товаров</p>
              <p className="text-xs text-zinc-600 font-sans mt-2">Нажмите «Добавить товар» чтобы создать первый</p>
            </div>
          )}
        </>
      )}

      {/* Create / Edit form */}
      {(mode === "create" || mode === "edit") && (
        <>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={closeForm}
              className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-xs font-display tracking-widest uppercase"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("products")}
            </button>
            <span className="text-zinc-700">/</span>
            <h1 className="text-xl font-display tracking-[0.2em] uppercase">
              {isEdit ? "Редактировать товар" : t("add_product")}
            </h1>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 p-6 max-w-3xl">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <Label>{t("product_name")} *</Label>
                <Input
                  value={form.name}
                  onChange={e => setField("name", e.target.value)}
                  maxLength={500}
                  placeholder="MINIMAL TEE SS26"
                  required
                  className="mt-2"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <Label>{t("product_description")}</Label>
                <textarea
                  value={form.description}
                  onChange={e => setField("description", e.target.value)}
                  maxLength={3000}
                  rows={3}
                  placeholder="Описание товара..."
                  className="w-full mt-2 bg-transparent border-b border-zinc-800 text-white text-sm font-sans py-2 px-0 focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600 resize-none"
                />
              </div>

              {/* Price */}
              <div>
                <Label>{t("product_price")} *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={e => setField("price", e.target.value)}
                  placeholder="25000"
                  min="0"
                  step="0.01"
                  required
                  className="mt-2"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <Label>{t("product_quantity")}</Label>
                <Input
                  type="number"
                  value={form.stockQuantity}
                  onChange={e => setField("stockQuantity", e.target.value)}
                  placeholder="0"
                  min="0"
                  className="mt-2"
                />
                <p className="text-[10px] text-zinc-600 mt-1 font-sans">0 = {t("preorder")}</p>
              </div>

              {/* Collection (optional) */}
              <div>
                <Label>{t("product_collection")}</Label>
                <Input
                  value={form.collection}
                  onChange={e => setField("collection", e.target.value)}
                  placeholder="SPRING SUMMER 2026"
                  className="mt-2"
                />
              </div>

              {/* Discount */}
              <div>
                <Label>{t("product_discount")}</Label>
                <Input
                  type="number"
                  value={form.discount}
                  onChange={e => setField("discount", e.target.value)}
                  placeholder="15"
                  min="0"
                  max="100"
                  className="mt-2"
                />
              </div>

              {/* Photo manager */}
              <div className="md:col-span-2">
                <Label>{t("product_photos")}</Label>
                <div className="mt-3 space-y-2">
                  {/* Existing photo list */}
                  {form.imageUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                      {/* Thumbnail preview */}
                      <div className="shrink-0 w-12 h-12 border border-zinc-800 overflow-hidden bg-zinc-900">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                      {/* URL text */}
                      <span className="flex-1 text-xs font-sans text-zinc-400 truncate">{url}</span>
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setField("imageUrls", form.imageUrls.filter((_, i) => i !== idx))}
                        className="shrink-0 text-zinc-700 hover:text-red-500 transition-colors"
                        aria-label="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add new photo URL */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const url = newImageUrl.trim();
                          if (url) { setField("imageUrls", [...form.imageUrls, url]); setNewImageUrl(""); }
                        }
                      }}
                      placeholder="https://example.com/photo.jpg"
                      className="flex-1 bg-transparent border-b border-zinc-800 text-white text-xs font-sans py-2 px-0 focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = newImageUrl.trim();
                        if (url) { setField("imageUrls", [...form.imageUrls, url]); setNewImageUrl(""); }
                      }}
                      className="shrink-0 text-zinc-500 hover:text-white transition-colors"
                      aria-label="Add photo"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {form.imageUrls.length === 0 && (
                    <p className="text-[10px] text-zinc-600 font-sans">Добавьте URL фотографии и нажмите +</p>
                  )}
                </div>
              </div>

              {/* Sizes */}
              <div className="md:col-span-2">
                <Label>{t("product_sizes")}</Label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {DEFAULT_SIZES.map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-4 h-9 border font-display tracking-widest text-xs uppercase transition-colors ${
                        form.selectedSizes.includes(sz)
                          ? "bg-white text-black border-white"
                          : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-500 hover:text-white"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                  {/* Custom sizes not in DEFAULT */}
                  {form.selectedSizes.filter(s => !DEFAULT_SIZES.includes(s)).map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className="px-4 h-9 border font-display tracking-widest text-xs uppercase bg-white text-black border-white"
                    >
                      {sz}
                    </button>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      value={form.customSize}
                      onChange={e => setField("customSize", e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomSize(); }}}
                      placeholder="Custom"
                      className="w-20 h-9 bg-transparent border-b border-zinc-800 text-white text-xs font-sans px-1 focus:outline-none focus:border-white placeholder:text-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={addCustomSize}
                      className="text-zinc-500 hover:text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {saveError && (
                <div className="md:col-span-2 text-xs text-red-400 font-sans border border-red-900 bg-red-950/30 px-4 py-3">
                  {saveError}
                </div>
              )}

              <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-zinc-900">
                {isEdit ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-400 transition-colors text-[11px] font-display tracking-widest uppercase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Удалить товар
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-4">
                  <Button type="button" variant="ghost" onClick={closeForm}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" isLoading={isSaving}>
                    {t("save")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete product confirmation modal */}
      {showDeleteConfirm && editingId !== null && (
        <DeleteProductModal
          productName={form.name}
          onConfirm={() => deleteProductMut.mutate({ id: editingId })}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={deleteProductMut.isPending}
        />
      )}
    </FranchiseLayout>
  );
}
