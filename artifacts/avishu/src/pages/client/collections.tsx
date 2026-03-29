import { useGetProducts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ClientNestedLayout } from "@/components/layout";
import { Spinner } from "@/components/ui-elements";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ClientCollections() {
  const { data: products, isLoading } = useGetProducts();
  const { t } = useLanguage();

  const collections = products
    ? Array.from(new Set(products.map(p => p.collection)))
    : [];

  return (
    <ClientNestedLayout backHref="/client">
      <div className="px-6 py-8">
        <div className="mb-8">
          <p className="text-[10px] font-display tracking-[0.25em] text-zinc-500 mb-2 uppercase">AVISHU / 2026</p>
          <h2 className="text-3xl font-display tracking-[0.15em] uppercase">{t("collections")}</h2>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col gap-5">
            {collections.map((collection, idx) => {
              const collectionProducts = products?.filter(p => p.collection === collection) || [];
              const previewImage = collectionProducts[0]?.imageUrl || `${import.meta.env.BASE_URL}images/hero-fashion.png`;

              return (
                <Link key={collection} href={`/client/collection/${encodeURIComponent(collection)}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="group relative overflow-hidden cursor-pointer border border-zinc-900 hover:border-zinc-700 transition-colors"
                  >
                    <div className="relative h-44 bg-zinc-900">
                      <img
                        src={previewImage}
                        alt={collection}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-[9px] font-display tracking-[0.3em] text-zinc-400 uppercase mb-1">
                        {collectionProducts.length} items
                      </p>
                      <h3 className="font-display tracking-[0.15em] text-lg uppercase text-white leading-tight">
                        {collection}
                      </h3>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ClientNestedLayout>
  );
}
