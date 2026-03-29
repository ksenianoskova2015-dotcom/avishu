import { useState } from "react";
import { useGetPlans, useCreatePlan } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { FranchiseLayout } from "@/components/layout";
import { Button, Input, Label, Spinner } from "@/components/ui-elements";
import { Plus, BarChart2 } from "lucide-react";
import { useLanguage, getMonthName } from "@/contexts/LanguageContext";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 1 + i);

export default function FranchisePlans() {
  const { data: plans, isLoading } = useGetPlans();
  const queryClient = useQueryClient();
  const { t, lang } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [amount, setAmount] = useState("");
  const [saveError, setSaveError] = useState("");

  const createPlanMut = useCreatePlan({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
        setSaveError("");
        setShowForm(false);
        setMonth(String(new Date().getMonth() + 1));
        setYear(String(CURRENT_YEAR));
        setAmount("");
      },
      onError: (err: any) => {
        setSaveError(err?.data?.error || err?.message || "Не удалось сохранить план");
      },
    }
  });

  function openForm() {
    setSaveError("");
    setShowForm(true);
  }

  function closeForm() {
    setSaveError("");
    setShowForm(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSaveError("Введите корректную сумму");
      return;
    }
    setSaveError("");
    createPlanMut.mutate({
      data: { month: parseInt(month), year: parseInt(year), amount: parsedAmount }
    });
  };

  const totalPlanned = plans?.reduce((acc, p) => acc + p.amount, 0) || 0;

  return (
    <FranchiseLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display tracking-[0.2em] uppercase">{t("plans")}</h1>
          <p className="text-zinc-500 text-xs font-display tracking-widest mt-1">
            {t("order_total")}: ₸ {totalPlanned.toLocaleString()}
          </p>
        </div>
        <Button onClick={() => showForm ? closeForm() : openForm()}>
          <Plus className="w-4 h-4 mr-2" />
          {t("add_plan")}
        </Button>
      </div>

      {/* Add Plan Form */}
      {showForm && (
        <div className="border border-zinc-800 bg-zinc-950 p-6 mb-8">
          <h2 className="font-display tracking-[0.2em] uppercase text-sm mb-6 border-b border-zinc-800 pb-4">{t("add_plan")}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <Label>{t("plan_month")}</Label>
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="w-full mt-2 bg-black border-b border-zinc-800 text-white text-sm font-display tracking-widest py-3 focus:outline-none focus:border-white transition-colors cursor-pointer"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{getMonthName(m, lang)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t("plan_year")}</Label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full mt-2 bg-black border-b border-zinc-800 text-white text-sm font-display tracking-widest py-3 focus:outline-none focus:border-white transition-colors cursor-pointer"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>{t("plan_amount")}</Label>
              <Input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="1000000"
                min="0"
                step="0.01"
                required
                className="mt-2"
              />
            </div>

            {saveError && (
              <div className="sm:col-span-3 text-xs text-red-400 font-sans border border-red-900 bg-red-950/30 px-4 py-3">
                {saveError}
              </div>
            )}

            <div className="sm:col-span-3 flex justify-end gap-4 pt-4 border-t border-zinc-900">
              <Button type="button" variant="ghost" onClick={closeForm}>{t("cancel")}</Button>
              <Button type="submit" isLoading={createPlanMut.isPending}>{t("save")}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Plans List */}
      {isLoading ? (
        <Spinner />
      ) : plans?.length === 0 ? (
        <div className="border border-zinc-800 p-20 flex flex-col items-center text-center">
          <BarChart2 className="w-12 h-12 text-zinc-700 mb-4" strokeWidth={1} />
          <p className="font-display tracking-widest text-zinc-500 uppercase text-sm">Нет планов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans?.map(plan => (
            <div key={plan.id} className="border border-zinc-800 bg-zinc-950 p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-display tracking-[0.2em] text-lg uppercase">
                  {getMonthName(plan.month, lang)}
                </span>
                <span className="text-zinc-500 font-display text-sm">{plan.year}</span>
              </div>
              <div className="w-full h-[1px] bg-zinc-900" />
              <div>
                <p className="text-[10px] font-display tracking-widest text-zinc-500 uppercase mb-1">{t("plan_amount")}</p>
                <p className="text-2xl font-display tracking-wider">₸ {plan.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </FranchiseLayout>
  );
}
