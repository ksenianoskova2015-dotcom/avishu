import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetProduct, useCreateOrder } from "@workspace/api-client-react";
import { Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Spinner } from "@/components/ui-elements";
import { ClientNestedLayout } from "@/components/layout";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ClientProduct() {
  const [_, params] = useRoute("/client/product/:id");
  const [__, setLocation] = useLocation();
  const productId = parseInt(params?.id || "0", 10);
  const { t } = useLanguage();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId }
  });

  const createOrderMut = useCreateOrder();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [orderError, setOrderError] = useState("");
  const touchStartX = useRef<number | null>(null);

  // Pre-select first size when product data loads
  useEffect(() => {
    if (product?.sizes?.length && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product?.id]);

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto border-x border-zinc-900">
        <Spinner />
      </div>
    );
  }

  // Build gallery from imageUrls + imageUrl fallback
  const gallery: string[] = product.imageUrls?.length
    ? product.imageUrls
    : [product.imageUrl || `${import.meta.env.BASE_URL}images/product-placeholder.png`];

  const handleOrder = () => {
    if (!selectedSize) {
      setOrderError(t("select_size"));
      return;
    }
    setOrderError("");
    createOrderMut.mutate({
      data: {
        productId: product.id,
        size: selectedSize,
        quantity: quantity
      }
    }, {
      onSuccess: () => {
        setLocation("/client/orders");
      },
      onError: (err: any) => {
        setOrderError(err?.data?.error || err?.message || "Не удалось оформить заказ");
      },
    });
  };

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : null;

  return (
    <div className="min-h-screen pb-24 flex flex-col relative max-w-md mx-auto border-x border-zinc-900 bg-black">
      {/* Header — hamburger as back */}
      <header className="absolute top-0 z-50 w-full flex items-center px-6 py-5 bg-gradient-to-b from-black/80 to-transparent">
        {/* Left — back */}
        <div className="flex-1 flex items-center">
          <button onClick={() => setLocation("/client")} className="text-white hover:text-zinc-300">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect y="3" width="20" height="2" rx="1"/>
              <rect y="9" width="20" height="2" rx="1"/>
              <rect y="15" width="20" height="2" rx="1"/>
            </svg>
          </button>
        </div>
        {/* Center — logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={`${import.meta.env.BASE_URL}images/logo.png`}
            alt="AVISHU"
            className="h-6 w-auto object-contain brightness-0 invert"
            draggable={false}
          />
        </div>
        {/* Right — spacer */}
        <div className="flex-1" />
      </header>

      {/* Image Gallery */}
      <div className="relative bg-zinc-950 border-b border-zinc-900">
        {/* Main image — touch-swipeable */}
        <div
          className="relative aspect-[3/4] overflow-hidden"
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return;
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(delta) < 40) return;
            if (delta < 0) setGalleryIdx(i => Math.min(i + 1, gallery.length - 1));
            else setGalleryIdx(i => Math.max(i - 1, 0));
          }}
        >
          <img
            src={gallery[galleryIdx]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.discount && (
            <div className="absolute top-16 left-0 bg-white text-black px-3 py-1 text-xs font-display tracking-widest">
              -{product.discount}%
            </div>
          )}

          {/* Arrow navigation — only if multiple images */}
          {gallery.length > 1 && galleryIdx > 0 && (
            <button
              onClick={() => setGalleryIdx(i => i - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 text-white hover:bg-black/70 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {gallery.length > 1 && galleryIdx < gallery.length - 1 && (
            <button
              onClick={() => setGalleryIdx(i => i + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 text-white hover:bg-black/70 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Dot indicators — overlaid bottom-center */}
          {gallery.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
              {gallery.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full ${
                    i === galleryIdx
                      ? "w-4 h-1 bg-white"
                      : "w-1 h-1 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip — visible only if multiple images */}
        {gallery.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto bg-black">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setGalleryIdx(i)}
                className={`shrink-0 w-14 h-14 border overflow-hidden transition-colors ${
                  i === galleryIdx ? "border-white" : "border-zinc-800 hover:border-zinc-500"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 flex-1">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-display tracking-[0.15em] uppercase mb-2 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 mb-1">
                {discountedPrice ? (
                  <>
                    <span className="text-zinc-600 line-through text-sm font-sans">{formatPrice(product.price)}</span>
                    <span className="text-white font-sans">{formatPrice(discountedPrice)}</span>
                  </>
                ) : (
                  <span className="text-zinc-400 font-sans">{formatPrice(product.price)}</span>
                )}
              </div>
              <p className={`text-[10px] font-display tracking-widest uppercase mt-0.5 ${
                product.type === "in_stock" ? "text-emerald-500" : "text-zinc-500"
              }`}>
                {product.type === "in_stock"
                  ? `${t("in_stock")}: ${product.stockQuantity}`
                  : t("preorder")}
              </p>
            </div>
          </div>

          <p className="text-zinc-500 text-sm font-sans leading-relaxed mb-10 border-l border-zinc-800 pl-4 py-1">
            {product.description}
          </p>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-display tracking-[0.2em] uppercase text-zinc-400">{t("select_size")}</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                {product.sizes?.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 min-w-12 px-4 border font-display tracking-widest text-sm transition-colors uppercase
                      ${selectedSize === size
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white border-zinc-800 hover:border-zinc-500"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-display tracking-[0.2em] uppercase text-zinc-400 block mb-4">{t("quantity")}</span>
              <div className="flex items-center border border-zinc-800 h-12 w-32">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 h-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-display">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex-1 h-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-black border-t border-zinc-900 p-4 pb-safe flex flex-col gap-2">
        {orderError && (
          <p className="text-xs text-red-400 font-sans text-center px-2">{orderError}</p>
        )}
        <Button
          className="w-full"
          variant={product.type === "preorder" ? "outline" : "default"}
          onClick={handleOrder}
          isLoading={createOrderMut.isPending}
        >
          {product.type === "preorder" ? t("preorder_now") : t("order_now")}
        </Button>
      </div>
    </div>
  );
}
