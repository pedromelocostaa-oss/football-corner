import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, parseISO, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export function MonthSelector() {
  const { selectedMonth, setSelectedMonth } = useApp();

  const current = parseISO(`${selectedMonth}-01`);
  const label = format(current, "MMMM 'de' yyyy", { locale: ptBR });

  const prev = () => setSelectedMonth(format(subMonths(current, 1), "yyyy-MM"));
  const next = () => setSelectedMonth(format(addMonths(current, 1), "yyyy-MM"));

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={prev} className="h-8 w-8">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-semibold capitalize min-w-[160px] text-center">{label}</span>
      <Button variant="outline" size="icon" onClick={next} className="h-8 w-8">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
