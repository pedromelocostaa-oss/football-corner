import { NavLink, useLocation } from "react-router-dom";
import { MonthSelector } from "@/components/MonthSelector";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Dashboard" },
  { to: "/mensalistas", label: "Mensalistas" },
  { to: "/avulsos", label: "Avulsos" },
  { to: "/caixa", label: "Caixa" },
  { to: "/membros", label: "Membros" },
  { to: "/publico", label: "Visão Pública" },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isPublic = location.pathname === "/publico";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1D9E75] text-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <span className="text-xl font-bold tracking-tight">Futebol dos Cria</span>
          </div>
          {!isPublic && <MonthSelector />}
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto gap-1 py-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#1D9E75] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
