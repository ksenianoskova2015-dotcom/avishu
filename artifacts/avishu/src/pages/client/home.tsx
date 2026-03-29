import { useGetProducts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ClientLayout } from "@/components/layout";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ClientHome() {
  const { data: products, isLoading } = useGetProducts({
    query: { refetchInterval: 10000 }
  });
  const { t } = useLanguage();

  return (
    <ClientLayout>
      {/* Hero Section — click to go to collections */}
      <Link href="/client/collections">
        <div className="relative h-[65vh] w-full bg-zinc-900 overflow-hidden cursor-pointer group">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-fashion.png`}
            alt="Spring Summer 2026"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-[10px] font-display tracking-[0.3em] uppercase text-zinc-300 mb-4 border border-zinc-500/50 px-3 py-1 inline-block">
                New Collection
              </p>
              <h2 className="text-4xl font-display tracking-[0.2em] leading-tight mb-6">
                SPRING —<br />SUMMER 2026
              </h2>
              <span className="text-[10px] font-display tracking-[0.3em] uppercase border border-white/60 px-4 py-2 text-white/80 group-hover:border-white group-hover:text-white transition-colors">
                SHOP NOW
              </span>
            </motion.div>
          </div>
        </div>
      </Link>

      <div className="px-6 py-12">
        <div className="flex items-end justify-between mb-8 border-b border-zinc-900 pb-4">
          <h3 className="text-2xl font-display tracking-widest uppercase">Catalog</h3>
          <span className="text-[10px] font-display tracking-[0.2em] text-zinc-500">AVISHU / 2026</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-zinc-900" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10">
            {products?.map((product, idx) => (
              <Link key={product.id} href={`/client/product/${product.id}`}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden mb-4 border border-zinc-900">
                    <img
                      src={product.imageUrl || `${import.meta.env.BASE_URL}images/product-placeholder.png`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="text-[9px] font-display tracking-[0.2em] uppercase bg-black/80 border border-zinc-800 px-2 py-1 text-white">
                        {product.type === "preorder" ? t("preorder") : t("in_stock")}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-display tracking-widest text-sm uppercase mb-1 truncate">{product.name}</h4>
                  <p className="text-zinc-500 text-xs font-sans mb-1">
                    {product.discount
                      ? <><span className="line-through text-zinc-700 mr-2">{formatPrice(product.price)}</span>{formatPrice(product.price * (1 - product.discount / 100))}</>
                      : formatPrice(product.price)
                    }
                  </p>
                  <p className={`text-[10px] font-display tracking-widest uppercase mt-0.5 ${
                    product.type === "in_stock" ? "text-emerald-500" : "text-zinc-500"
                  }`}>
                    {product.type === "in_stock"
                      ? `${t("in_stock")}: ${product.stockQuantity}`
                      : t("preorder")}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
