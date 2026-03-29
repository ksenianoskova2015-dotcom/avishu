import { useGetMe, useLogout } from "@workspace/api-client-react";
import { clearToken } from "@/lib/auth-token";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { UserCircle2, LogOut } from "lucide-react";
import { Button, Spinner } from "@/components/ui-elements";
import { ClientNestedLayout } from "@/components/layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ClientProfile() {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetMe();
  const { t } = useLanguage();

  const logoutMut = useLogout({
    mutation: {
      onSuccess: () => {
        clearToken();
        queryClient.clear();
        setLocation("/login");
      }
    }
  });

  return (
    <ClientNestedLayout backHref="/client" title={t("profile")}>
      {isLoading ? (
        <Spinner />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col p-8 gap-10"
        >
          <div className="flex flex-col items-center gap-5 pt-6">
            <div className="w-24 h-24 border border-zinc-800 bg-zinc-900 flex items-center justify-center">
              <UserCircle2 className="w-12 h-12 text-zinc-600" strokeWidth={1} />
            </div>
            <div className="text-center">
              <h2 className="font-display text-2xl tracking-[0.15em] uppercase mb-1">{user?.name}</h2>
              <p className="text-xs font-sans text-zinc-500 tracking-wider">{user?.email}</p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-zinc-900" />

          <div className="space-y-5">
            <div className="flex flex-col gap-1 pb-4 border-b border-zinc-900/60">
              <span className="text-[10px] font-display tracking-[0.25em] text-zinc-500 uppercase">{t("name")}</span>
              <span className="font-display text-base tracking-widest uppercase">{user?.name}</span>
            </div>
            <div className="flex flex-col gap-1 pb-4 border-b border-zinc-900/60">
              <span className="text-[10px] font-display tracking-[0.25em] text-zinc-500 uppercase">{t("email")}</span>
              <span className="font-sans text-sm text-zinc-300">{user?.email}</span>
            </div>
            <div className="flex flex-col gap-1 pb-4 border-b border-zinc-900/60">
              <span className="text-[10px] font-display tracking-[0.25em] text-zinc-500 uppercase">{t("role")}</span>
              <span className="font-display text-sm tracking-widest uppercase text-zinc-400">{user?.role}</span>
            </div>
          </div>

          <div className="flex-1" />

          <Button
            variant="outline"
            className="w-full flex items-center gap-3"
            onClick={() => logoutMut.mutate()}
            isLoading={logoutMut.isPending}
          >
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </Button>
        </motion.div>
      )}
    </ClientNestedLayout>
  );
}
