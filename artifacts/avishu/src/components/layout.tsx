import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { User, ShoppingBag, Menu, LayoutDashboard, Package, BarChart2, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Lang } from "@/contexts/LanguageContext";

// ─── Logo ────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}images/logo.png`}
      alt="AVISHU"
      className="h-7 w-auto object-contain brightness-0 invert"
      draggable={false}
    />
  );
}

// ─── Globe Language Picker (dropdown) ────────────────────────────────────────
// The dropdown uses position:fixed to escape the header's backdrop-filter
// stacking context, which would otherwise make it appear blurry.
function LangPicker() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  function openDropdown() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({
        top: r.bottom + 8,
        right: window.innerWidth - r.right,
      });
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      const insideBtn = btnRef.current?.contains(target);
      const insideDrop = dropRef.current?.contains(target);
      if (!insideBtn && !insideDrop) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const labels: Record<Lang, string> = {
    kz: "Қазақша",
    ru: "Русский",
    en: "English",
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => open ? setOpen(false) : openDropdown()}
        className={`transition-colors ${open ? "text-white" : "text-zinc-400 hover:text-white"}`}
        aria-label="Language"
      >
        <Globe className="w-5 h-5" />
      </button>

      {open && (
        <div
          ref={dropRef}
          style={{ position: "fixed", top: dropPos.top, right: dropPos.right, zIndex: 9999 }}
          className="bg-black border border-zinc-700 min-w-[130px]"
        >
          {(["kz", "ru", "en"] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => { setLang(l); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-[11px] font-display tracking-widest uppercase transition-colors ${
                lang === l
                  ? "text-white bg-zinc-900"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              {labels[l]}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── CLIENT MAIN LAYOUT ──────────────────────────────────────────────────────
export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen pb-20 flex flex-col relative max-w-md mx-auto border-x border-zinc-900 bg-black">
      <header className="sticky top-0 z-50 flex items-center px-6 py-4 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        {/* Left — empty placeholder to balance right slot */}
        <div className="flex-1 flex items-center">
          <div className="w-5 h-5" />
        </div>
        {/* Center — logo, truly centered via absolute */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Logo />
        </div>
        {/* Right — profile + lang */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <LangPicker />
          <Link href="/client/profile">
            <button className="text-zinc-400 hover:text-white transition-colors" aria-label="Profile">
              <User className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">{children}</main>

      <nav className="fixed bottom-0 w-full max-w-md bg-black border-t border-zinc-900 pb-safe">
        <div className="flex items-center justify-around h-16">
          <Link href="/client/orders" className="flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-white transition-colors font-display tracking-widest text-[10px] uppercase gap-1.5">
            <ShoppingBag className="w-4 h-4 mb-0.5" />
            {t("orders")}
          </Link>
        </div>
      </nav>
    </div>
  );
}

// ─── CLIENT NESTED LAYOUT (back-navigable screens) ───────────────────────────
export function ClientNestedLayout({
  children,
  backHref,
}: {
  children: React.ReactNode;
  backHref: string;
  title?: string;
}) {
  const [_, setLocation] = useLocation();
  return (
    <div className="min-h-screen pb-20 flex flex-col relative max-w-md mx-auto border-x border-zinc-900 bg-black">
      <header className="sticky top-0 z-50 flex items-center px-6 py-4 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        {/* Left — back */}
        <div className="flex-1 flex items-center">
          <button
            onClick={() => setLocation(backHref)}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Back"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        {/* Center — logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Logo />
        </div>
        {/* Right — spacer matching left width */}
        <div className="flex-1 flex items-center justify-end">
          <div className="w-5 h-5" />
        </div>
      </header>

      <main className="flex-1 flex flex-col">{children}</main>

      <nav className="fixed bottom-0 w-full max-w-md bg-black border-t border-zinc-900 pb-safe">
        <div className="flex items-center justify-around h-16">
          <Link href="/client/orders" className="flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-white transition-colors font-display tracking-widest text-[10px] uppercase gap-1.5">
            <ShoppingBag className="w-4 h-4 mb-0.5" />
          </Link>
        </div>
      </nav>
    </div>
  );
}

// ─── FRANCHISE LAYOUT ─────────────────────────────────────────────────────────
export function FranchiseLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { href: "/franchise", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/franchise/products", icon: Package, label: t("products") },
    { href: "/franchise/plans", icon: BarChart2, label: t("plans") },
  ];

  const isActive = (href: string) => {
    if (href === "/franchise") return location === "/franchise";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-black border-b border-zinc-900 flex items-center px-6 py-4">
        {/* Left — empty placeholder */}
        <div className="flex-1 flex items-center">
          <div className="w-5 h-5" />
        </div>
        {/* Center — logo */}
        <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
          <Logo />
        </div>
        {/* Right — lang + profile */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <LangPicker />
          <Link href="/franchise/profile">
            <button className="text-zinc-400 hover:text-white transition-colors p-1" aria-label="Profile">
              <User className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </header>

      {/* Tab bar */}
      <div className="sticky top-[57px] z-40 bg-black border-b border-zinc-900 flex">
        {tabs.map(({ href, icon: Icon, label }) => (
          <button
            key={href}
            onClick={() => setLocation(href)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-display tracking-widest uppercase transition-colors border-b-2 ${
              isActive(href)
                ? "text-white border-white"
                : "text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

// ─── PRODUCTION LAYOUT ────────────────────────────────────────────────────────
export function ProductionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-black border-b border-zinc-900 flex items-center px-6 py-4">
        {/* Left — empty placeholder */}
        <div className="flex-1 flex items-center">
          <div className="w-5 h-5" />
        </div>
        {/* Center — logo */}
        <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
          <Logo />
        </div>
        {/* Right — lang + profile */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <LangPicker />
          <Link href="/production/profile">
            <button className="text-zinc-400 hover:text-white transition-colors p-1" aria-label="Profile">
              <User className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
}

// Keep old DashboardLayout as an alias for backward compatibility
export function DashboardLayout({ children, role }: { children: React.ReactNode; role: "FRANCHISE" | "PRODUCTION" }) {
  if (role === "FRANCHISE") return <FranchiseLayout>{children}</FranchiseLayout>;
  return <ProductionLayout>{children}</ProductionLayout>;
}
