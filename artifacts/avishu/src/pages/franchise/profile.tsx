import { useGetMe, useLogout } from "@workspace/api-client-react";
import { clearToken } from "@/lib/auth-token";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { FranchiseLayout } from "@/components/layout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FranchiseProfile() {
  const { data: user } = useGetMe();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();
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

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "F";

  return (
    <FranchiseLayout>
      <div className="max-w-sm mx-auto pt-12 pb-16 flex flex-col items-center gap-8">
        {/* Avatar */}
        <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <span className="font-display text-3xl tracking-widest text-white">{initials}</span>
        </div>

        {/* Info */}
        <div className="w-full flex flex-col gap-4 text-center">
          {user?.name && (
            <div>
              <p className="text-[10px] font-display tracking-widest uppercase text-zinc-500 mb-1">{t("name")}</p>
              <p className="font-display tracking-[0.15em] text-lg uppercase">{user.name}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-display tracking-widest uppercase text-zinc-500 mb-1">{t("email")}</p>
            <p className="font-sans text-sm text-zinc-300">{user?.email}</p>
          </div>
          <div>
            <p className="text-[10px] font-display tracking-widest uppercase text-zinc-500 mb-1">{t("role")}</p>
            <p className="font-display tracking-widest text-xs uppercase text-zinc-400">Franchise</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-zinc-900" />

        {/* Logout */}
        <button
          onClick={() => logoutMut.mutate()}
          disabled={logoutMut.isPending}
          className="w-full border border-zinc-800 py-3 font-display tracking-[0.25em] text-xs uppercase text-zinc-400 hover:text-white hover:border-white transition-colors disabled:opacity-50"
        >
          {t("logout") || "ВЫЙТИ"}
        </button>
      </div>
    </FranchiseLayout>
  );
}
