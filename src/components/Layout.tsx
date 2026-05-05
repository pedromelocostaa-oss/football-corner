import { NavLink, useLocation } from "react-router-dom";
import { MonthSelector } from "@/components/MonthSelector";
import {
  LayoutDashboard,
  CreditCard,
  Zap,
  Wallet,
  Users,
  Eye,
} from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mensalistas", label: "Mensalistas", icon: CreditCard },
  { to: "/avulsos", label: "Avulsos", icon: Zap },
  { to: "/caixa", label: "Caixa", icon: Wallet },
  { to: "/membros", label: "Membros", icon: Users },
  { to: "/publico", label: "Público", icon: Eye },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isPublic = location.pathname === "/publico";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1D9E75] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl leading-none">⚽</span>
            <span className="text-lg font-bold tracking-tight">Futebol dos Cria</span>
          </div>
          {!isPublic && <MonthSelector />}
        </div>
      </header>

      {/* Desktop nav — hidden on mobile */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-10 hidden md:block">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-[#1D9E75] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Content — extra bottom padding on mobile to avoid overlap with bottom nav */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t shadow-lg md:hidden">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(tab.to);
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === "/"}
                className={`flex flex-1 flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
                  isActive ? "text-[#1D9E75]" : "text-gray-400"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`}
                />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
