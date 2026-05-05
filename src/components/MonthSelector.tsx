import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, parseISO, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export function MonthSelector() {
  const { selectedMonth, setSelectedMonth } = useApp();

  const current = parseISO(`${selectedMonth}-01`);
  const today = new Date();
  const isCurrentMonth = isSameMonth(current, today);
  const label = format(current, "MMM/yyyy", { locale: ptBR });

  const prev = () => setSelectedMonth(format(subMonths(current, 1), "yyyy-MM"));
  const next = () => setSelectedMonth(format(addMonths(current, 1), "yyyy-MM"));
  const goToday = () => setSelectedMonth(format(today, "yyyy-MM"));

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={prev}
        className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <button
        onClick={goToday}
        disabled={isCurrentMonth}
        className="text-sm font-semibold capitalize min-w-[88px] text-center px-1 py-1 rounded
          text-white disabled:cursor-default
          hover:bg-white/20 disabled:hover:bg-transparent transition-colors"
        title={isCurrentMonth ? "Mês atual" : "Ir para o mês atual"}
      >
        {label}
      </button>

      <Button
        variant="ghost"
        size="icon"
        onClick={next}
        className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
