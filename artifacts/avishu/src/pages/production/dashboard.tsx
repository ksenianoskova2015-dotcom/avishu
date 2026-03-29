import { useState, useEffect, useRef } from "react";
import { useGetOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ProductionLayout } from "@/components/layout";
import { Spinner } from "@/components/ui-elements";
import { useLanguage } from "@/contexts/LanguageContext";

const STATUS_OPTIONS = [
  { value: "created",     labelKey: "status_created"     },
  { value: "in_progress", labelKey: "status_in_progress" },
  { value: "done",        labelKey: "status_done"        },
  { value: "shipped",     labelKey: "status_shipped"     },
  { value: "received",    labelKey: "status_received"    },
] as const;

const STATUS_COLORS: Record<string, string> = {
  created:     "border-zinc-700 text-zinc-400",
  in_progress: "border-blue-800 text-blue-400",
  done:        "border-green-800 text-green-400",
  shipped:     "border-amber-800 text-amber-400",
  received:    "border-emerald-800 text-emerald-400",
};

const STATUS_DOT: Record<string, string> = {
  created:     "bg-zinc-500",
  in_progress: "bg-blue-500",
  done:        "bg-green-500",
  shipped:     "bg-amber-500",
  received:    "bg-emerald-400",
};

export default function ProductionDashboard() {
  const { data: orders, isLoading } = useGetOrders({
    query: { refetchInterval: 3000 }
  });
  const { t } = useLanguage();

  const updateStatusMut = useUpdateOrderStatus();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusError, setStatusError] = useState("");
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  // Auto-clear error banner after 4 seconds
  useEffect(() => {
    if (statusError) {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setStatusError(""), 4000);
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [statusError]);

  const handleStatusChange = (orderId: number, newStatus: string) => {
    // Capture previous status for explicit rollback on failure
    const cachedOrders = queryClient.getQueryData<{ id: number; status: string }[]>(["/api/orders"]);
    const prevStatus = cachedOrders?.find(o => o.id === orderId)?.status;

    setUpdatingId(orderId);
    setStatusError("");
    updateStatusMut.mutate(
      { id: orderId, data: { status: newStatus as any } },
      {
        onSettled: () => setUpdatingId(null),
        onError: (err: any) => {
          setStatusError(err?.data?.error || err?.message || "Не удалось обновить статус");
          // Explicitly rollback to previous status in query cache immediately
          if (prevStatus !== undefined) {
            queryClient.setQueryData<any[]>(["/api/orders"], old =>
              old?.map(o => o.id === orderId ? { ...o, status: prevStatus } : o)
            );
          } else {
            queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
          }
        },
      }
    );
  };

  // Group orders by status
  const grouped: Record<string, typeof orders> = {};
  STATUS_OPTIONS.forEach(s => { grouped[s.value] = []; });
  orders?.forEach(o => {
    if (!grouped[o.status]) grouped[o.status] = [];
    grouped[o.status]!.push(o);
  });

  // Helper to get translation key
  const getLabel = (value: string) => {
    const opt = STATUS_OPTIONS.find(o => o.value === value);
    return opt ? (t as any)(opt.labelKey) : value;
  };

  return (
    <ProductionLayout>
      {statusError && (
        <div className="mb-4 text-xs text-red-400 font-sans border border-red-900 bg-red-950/30 px-4 py-3">
          {statusError}
        </div>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-6">
          {STATUS_OPTIONS.map(({ value, labelKey }) => {
            const sectionOrders = grouped[value] || [];
            return (
              <div key={value} className="border border-zinc-800">
                {/* Section header */}
                <div className={`px-4 py-3 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[value]}`} />
                  <h2 className="font-display tracking-[0.2em] uppercase text-sm text-white">{(t as any)(labelKey)}</h2>
                  <span className="text-zinc-600 text-xs font-display ml-auto">{sectionOrders.length}</span>
                </div>

                {sectionOrders.length === 0 ? (
                  <div className="px-4 py-5 text-zinc-700 text-xs font-display tracking-widest uppercase text-center">
                    —
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-900">
                    {sectionOrders.map(order => (
                      <div key={order.id} className="px-4 py-4 flex items-center gap-4 flex-wrap">
                        {/* Product image */}
                        <div className="w-10 h-12 shrink-0 bg-zinc-900 overflow-hidden border border-zinc-800">
                          <img
                            src={order.productImageUrl || `${import.meta.env.BASE_URL}images/product-placeholder.png`}
                            alt={order.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Order info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-display tracking-widest text-white text-xs">#{order.id}</span>
                            <span className="text-zinc-600 text-xs font-sans">— {order.userEmail}</span>
                          </div>
                          <p className="font-display tracking-widest text-sm uppercase text-white truncate">{order.productName}</p>
                          <p className="text-zinc-500 text-xs font-sans">{t("size")}: {order.size} / {t("quantity")}: {order.quantity}</p>
                        </div>

                        {/* Status dropdown */}
                        <div className="shrink-0">
                          <select
                            className={`bg-black border text-xs font-display tracking-widest uppercase px-3 py-2 outline-none transition-colors cursor-pointer ${
                              STATUS_COLORS[order.status] || "border-zinc-700 text-zinc-400"
                            } ${updatingId === order.id ? "opacity-50" : ""}`}
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{(t as any)(opt.labelKey)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ProductionLayout>
  );
}
