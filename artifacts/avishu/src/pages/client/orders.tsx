import { useState } from "react";
import { useGetOrders, useDeleteOrder } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ClientNestedLayout } from "@/components/layout";
import { format } from "date-fns";
import { Card, Spinner } from "@/components/ui-elements";
import { Trash2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Status config: color dot + label key
const STATUS_CONFIG: Record<string, { dot: string; labelKey: string }> = {
  created:     { dot: "bg-zinc-500",    labelKey: "status_created"     },
  in_progress: { dot: "bg-blue-500",    labelKey: "status_in_progress" },
  done:        { dot: "bg-green-500",   labelKey: "status_done"        },
  shipped:     { dot: "bg-amber-500",   labelKey: "status_shipped"     },
  received:    { dot: "bg-emerald-400", labelKey: "status_received"    },
};

const STEPS = [
  { key: "created",     labelKey: "status_created"     },
  { key: "in_progress", labelKey: "status_in_progress" },
  { key: "done",        labelKey: "status_done"        },
  { key: "shipped",     labelKey: "status_shipped"     },
  { key: "received",    labelKey: "status_received"    },
];

const stepIndex = (status: string) => STEPS.findIndex(s => s.key === status);

// ─── In-app confirmation modal ──────────────────────────────────────────────
function DeleteConfirmModal({
  onConfirm,
  onCancel,
  isLoading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-10 px-4 bg-black/75">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 p-6 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <p className="font-display tracking-widest text-sm uppercase leading-snug pr-4">
            Вы точно хотите удалить товар из заказов?
          </p>
          <button onClick={onCancel} className="text-zinc-600 hover:text-white transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
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
            className="flex-1 py-2.5 bg-white text-black text-[11px] font-display tracking-widest uppercase hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? "..." : "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientOrders() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [confirmOrderId, setConfirmOrderId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const { data: orders, isLoading } = useGetOrders({
    query: { refetchInterval: 3000 }
  });

  const deleteOrderMut = useDeleteOrder({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        setConfirmOrderId(null);
        setDeleteError("");
      },
      onError: (err: any) => {
        setConfirmOrderId(null);
        setDeleteError(err?.data?.error || err?.message || "Не удалось удалить заказ");
      },
    }
  });

  const handleDeleteClick = (orderId: number) => {
    setConfirmOrderId(orderId);
  };

  const handleConfirmDelete = () => {
    if (confirmOrderId !== null) {
      deleteOrderMut.mutate({ id: confirmOrderId });
    }
  };

  return (
    <ClientNestedLayout backHref="/client">
      <div className="p-6 pb-12">
        <h2 className="text-2xl font-display tracking-widest uppercase mb-8 border-b border-zinc-900 pb-4">
          {t("orders")}
        </h2>

        {deleteError && (
          <div className="mb-4 text-xs text-red-400 font-sans border border-red-900 bg-red-950/30 px-4 py-3">
            {deleteError}
          </div>
        )}

        {isLoading ? (
          <Spinner />
        ) : orders?.length === 0 ? (
          <div className="text-center py-20 border border-zinc-900">
            <p className="font-display tracking-[0.2em] text-zinc-500 uppercase text-sm">{t("no_orders")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.created;
              const currentStepIdx = stepIndex(order.status);
              const canDelete = order.status === "created";
              const isDeleting = deleteOrderMut.isPending && confirmOrderId === order.id;

              return (
                <Card key={order.id} className="p-5 flex flex-col gap-5 border-zinc-900 relative overflow-hidden">
                  {/* Product image + info row */}
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-20 flex-shrink-0 bg-zinc-900 border border-zinc-800 overflow-hidden">
                      <img
                        src={order.productImageUrl || `${import.meta.env.BASE_URL}images/product-placeholder.png`}
                        alt={order.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-display tracking-[0.2em] text-zinc-500 uppercase mb-1 block">
                        {t("order_number")} #{order.id} • {format(new Date(order.createdAt), "dd MMM yyyy")}
                      </span>
                      <h4 className="font-display tracking-widest uppercase text-sm leading-tight truncate">
                        {order.productName}
                      </h4>
                      <p className="text-xs text-zinc-400 font-sans mt-1">
                        {t("size")}: {order.size} / {t("quantity")}: {order.quantity}
                      </p>
                    </div>

                    {/* Colored status dot + label */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-display tracking-widest uppercase text-zinc-400">
                          {(t as any)(cfg.labelKey)}
                        </span>
                        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} animate-pulse`} />
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteClick(order.id)}
                          disabled={isDeleting}
                          className="text-zinc-600 hover:text-red-500 transition-colors disabled:opacity-40"
                          title={t("delete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Stepper (5 steps) */}
                  <div className="pt-4 border-t border-zinc-900/50">
                    <div className="flex justify-between items-center relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-zinc-900 z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] z-0 transition-all duration-700"
                        style={{
                          width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%`,
                          backgroundColor: currentStepIdx >= 0 ? "#10b981" : "#71717a"
                        }}
                      />
                      {STEPS.map((s, i) => {
                        const done = i <= currentStepIdx;
                        return (
                          <div key={s.key} className="z-10 flex flex-col items-center gap-2 bg-card px-1">
                            <div className={`w-2 h-2 border transition-colors duration-500 ${
                              done
                                ? `border-transparent ${STATUS_CONFIG[s.key]?.dot}`
                                : "bg-black border-zinc-700"
                            }`} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-3 text-[8px] font-display tracking-[0.1em] uppercase text-zinc-500 gap-1">
                      {STEPS.map((s, i) => (
                        <span key={s.key} className={`text-center ${i <= currentStepIdx ? "text-white" : ""}`}>
                          {(t as any)(s.labelKey)}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* In-app delete confirmation modal */}
      {confirmOrderId !== null && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOrderId(null)}
          isLoading={deleteOrderMut.isPending}
        />
      )}
    </ClientNestedLayout>
  );
}
