import { useGetOrders } from "@workspace/api-client-react";
import { FranchiseLayout } from "@/components/layout";
import { format, isToday, isThisWeek, isThisMonth, isThisYear } from "date-fns";
import { Badge, Spinner } from "@/components/ui-elements";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type FilterKey = "today" | "week" | "month" | "year";

const statusBadgeVariant: Record<string, "outline" | "success" | "warning" | "default"> = {
  created:     "outline",
  in_progress: "default",
  done:        "success",
  shipped:     "warning",
  received:    "success",
};

export default function FranchiseDashboard() {
  const { data: orders, isLoading } = useGetOrders({
    query: { refetchInterval: 5000 }
  });
  const { t } = useLanguage();
  const [filter, setFilter] = useState<FilterKey>("today");

  const filterFns: Record<FilterKey, (d: Date) => boolean> = {
    today: isToday,
    week:  (d) => isThisWeek(d, { weekStartsOn: 1 }),
    month: isThisMonth,
    year:  isThisYear,
  };

  const filteredOrders = orders?.filter(o => filterFns[filter](new Date(o.createdAt))) || [];
  const revenue = orders?.reduce((acc, o) => acc + (o.totalPrice * o.quantity), 0) || 0;
  const filteredRevenue = filteredOrders.reduce((acc, o) => acc + (o.totalPrice * o.quantity), 0);
  const activeOrders = orders?.filter(o => o.status !== "received").length || 0;

  // Chart: group by status for filtered range
  const statusCounts: Record<string, number> = {};
  filteredOrders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(statusCounts), 1);

  const statusLabels: Record<string, string> = {
    created:     t("status_created"),
    in_progress: t("status_in_progress"),
    done:        t("status_done"),
    shipped:     t("status_shipped"),
    received:    t("status_received"),
  };
  const statusColors: Record<string, string> = {
    created:     "bg-zinc-500",
    in_progress: "bg-blue-500",
    done:        "bg-green-500",
    shipped:     "bg-amber-500",
    received:    "bg-emerald-400",
  };

  const FILTERS: FilterKey[] = ["today", "week", "month", "year"];

  return (
    <FranchiseLayout>
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-display tracking-[0.2em] text-zinc-500 uppercase mb-2">{t("revenue")}</p>
          <p className="text-2xl font-display tracking-wider">₸ {revenue.toLocaleString()}</p>
        </div>
        <div className="border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-display tracking-[0.2em] text-zinc-500 uppercase mb-2">{t("active_orders")}</p>
          <p className="text-2xl font-display tracking-wider">{activeOrders}</p>
        </div>
        <div className="border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs font-display tracking-[0.2em] text-zinc-500 uppercase mb-2">{t("total_orders")}</p>
          <p className="text-2xl font-display tracking-wider">{orders?.length || 0}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="border border-zinc-800 bg-zinc-950/50 mb-8">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display tracking-[0.2em] uppercase text-sm">{t("orders_chart")}</h2>
          <div className="flex gap-1">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[10px] font-display tracking-widest uppercase transition-colors ${
                  filter === f ? "bg-white text-black" : "text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600"
                }`}
              >
                {t(f)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Order amount for period */}
          <div className="mb-6 p-4 border border-zinc-800 bg-black">
            <p className="text-[10px] font-display tracking-widest text-zinc-500 uppercase mb-1">{t("order_total")}</p>
            <p className="text-2xl font-display tracking-wider">₸ {filteredRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-600 font-sans mt-1">{filteredOrders.length} {t("total_orders").toLowerCase()}</p>
          </div>

          {/* Bar chart by status */}
          {filteredOrders.length === 0 ? (
            <p className="text-zinc-600 text-xs font-display tracking-widest uppercase text-center py-8">{t("no_orders")}</p>
          ) : (
            <div className="flex items-end gap-3 h-28 mt-2">
              {Object.keys(statusLabels).map(status => {
                const count = statusCounts[status] || 0;
                const height = count === 0 ? 4 : Math.max(12, (count / maxCount) * 96);
                return (
                  <div key={status} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[10px] font-display text-zinc-400">{count}</span>
                    <div
                      className={`w-full ${statusColors[status]} transition-all duration-500`}
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-[8px] font-display tracking-widest text-zinc-500 uppercase text-center leading-tight">
                      {statusLabels[status]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-zinc-800 bg-zinc-950/50">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="font-display tracking-[0.2em] uppercase text-sm">{t("all_orders")}</h2>
          <Badge variant="outline">{orders?.length || 0} Total</Badge>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/20 text-zinc-500 font-display tracking-[0.15em] text-[10px] uppercase">
                  <th className="px-4 py-3 font-normal whitespace-nowrap">#</th>
                  <th className="px-4 py-3 font-normal whitespace-nowrap">Client</th>
                  <th className="px-4 py-3 font-normal whitespace-nowrap">Product</th>
                  <th className="px-4 py-3 font-normal whitespace-nowrap">Sum</th>
                  <th className="px-4 py-3 font-normal whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-sans text-zinc-300">
                {orders?.map(order => (
                  <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-display tracking-wider text-white text-xs">#{order.id}</div>
                      <div className="text-[10px] text-zinc-600">{format(new Date(order.createdAt), "dd MMM")}</div>
                    </td>
                    <td className="px-4 py-3 text-xs truncate max-w-[100px]">{order.userEmail}</td>
                    <td className="px-4 py-3">
                      <div className="font-display tracking-wide uppercase text-white text-xs truncate max-w-[100px]">{order.productName}</div>
                      <div className="text-[10px] text-zinc-500">{order.size} × {order.quantity}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      ₸ {(order.totalPrice * order.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant[order.status] || "outline"}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {orders?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-zinc-500 font-display tracking-widest uppercase text-xs">
                      {t("no_orders")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FranchiseLayout>
  );
}
