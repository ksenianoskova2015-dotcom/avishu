import { useGetProducts } from "@workspace/api-client-react";
import { Link, useRoute } from "wouter";
import { ClientNestedLayout } from "@/components/layout";
import { Spinner } from "@/components/ui-elements";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ClientCollection() {
  const [_, params] = useRoute("/client/collection/:name");
  const collectionName = decodeURIComponent(params?.name || "");
  const { t } = useLanguage();

  const { data: products, isLoading } = useGetProducts();
  const filtered = products?.filter(p => p.collection === collectionName) || [];

  return (
    <ClientNestedLayout backHref="/client/collections">
      <div className="px-6 py-8 pb-24">
        <div className="mb-8">
          <p className="text-[10px] font-display tracking-[0.25em] text-zinc-500 mb-2 uppercase">Collection</p>
          <h2 className="text-2xl font-display tracking-[0.15em] uppercase leading-tight">{collectionName}</h2>
        </div>

        {isLoading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-zinc-900">
            <p className="font-display tracking-[0.2em] text-zinc-500 uppercase text-sm">No items</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10">
            {filtered.map((product, idx) => (
              <Link key={product.id} href={`/client/product/${product.id}`}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.08 }}
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
                  <p className="text-zinc-500 text-xs font-sans">{formatPrice(product.price)}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ClientNestedLayout>
  );
}
