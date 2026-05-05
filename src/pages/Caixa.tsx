import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Wallet, MinusCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const TIPO_LABELS: Record<string, string> = {
  mensalidade: "Mensalidade",
  avulso: "Avulso",
  despesa: "Despesa",
};

const TIPO_STYLES: Record<string, string> = {
  mensalidade: "bg-green-50 text-green-700 border-green-200",
  avulso: "bg-amber-50 text-amber-700 border-amber-200",
  despesa: "bg-red-50 text-red-700 border-red-200",
};

// Group extrato items by date
function groupByDate(entries: ReturnType<typeof useApp>["caixa"]) {
  const groups: Record<string, typeof entries> = {};
  for (const e of entries) {
    const key = format(new Date(e.data), "yyyy-MM-dd");
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));
}

export default function Caixa() {
  const { caixa, saldoCaixa, totalEntradas, totalSaidas, addDespesa } = useApp();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [descricaoError, setDescricaoError] = useState("");
  const [valorError, setValorError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let ok = true;
    setDescricaoError("");
    setValorError("");

    if (!descricao.trim()) {
      setDescricaoError("Informe a descrição.");
      ok = false;
    }
    const v = parseFloat(valor.replace(",", "."));
    if (isNaN(v) || v <= 0) {
      setValorError("Valor inválido.");
      ok = false;
    }
    if (!ok) return;

    addDespesa(descricao.trim(), v);
    toast.success(`Despesa registrada: −R$${v.toFixed(2)}`);
    setDescricao("");
    setValor("");
  };

  const grouped = groupByDate([...caixa].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  ));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800">Caixa</h1>

      {/* Big saldo card */}
      <Card
        className={`border-0 shadow-md text-white ${
          saldoCaixa >= 0
            ? "bg-gradient-to-br from-blue-600 to-blue-700"
            : "bg-gradient-to-br from-red-600 to-red-700"
        }`}
      >
        <CardContent className="pt-5 pb-5">
          <p className="text-sm text-blue-200 font-medium mb-1 flex items-center gap-1">
            <Wallet className="h-4 w-4" /> Saldo Atual
          </p>
          <p className="text-4xl font-black tracking-tight">
            R$ {saldoCaixa.toFixed(2)}
          </p>
          <Separator className="my-4 bg-white/20" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-200 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> Entradas
              </p>
              <p className="text-lg font-bold">R$ {totalEntradas.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" /> Saídas
              </p>
              <p className="text-lg font-bold">R$ {totalSaidas.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Register expense */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MinusCircle className="h-4 w-4 text-red-500" /> Registrar Despesa
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3 mb-3">
              <div className="space-y-1">
                <Label className="text-sm">Descrição</Label>
                <Input
                  value={descricao}
                  onChange={(e) => { setDescricao(e.target.value); setDescricaoError(""); }}
                  placeholder="Ex: Bola Nike, Colete, Aluguel campo…"
                  className={descricaoError ? "border-red-400" : ""}
                />
                {descricaoError && <p className="text-xs text-red-500">{descricaoError}</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Valor (R$)</Label>
                <Input
                  value={valor}
                  onChange={(e) => { setValor(e.target.value); setValorError(""); }}
                  placeholder="0,00"
                  inputMode="decimal"
                  className={valorError ? "border-red-400" : ""}
                />
                {valorError && <p className="text-xs text-red-500">{valorError}</p>}
              </div>
            </div>
            <Button type="submit" variant="destructive" className="w-full sm:w-auto">
              <MinusCircle className="h-4 w-4 mr-1.5" /> Debitar do caixa
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Extrato */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Extrato</CardTitle>
            <span className="text-xs text-gray-400">{caixa.length} lançamentos</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {caixa.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <TrendingUp className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="text-gray-400 text-sm">Nenhum lançamento ainda.</p>
              <p className="text-gray-300 text-xs">
                Pagamentos de mensalistas e avulsos aparecem aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map(({ date, items }) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                  <div className="space-y-1.5">
                    {items.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                              entry.valor >= 0
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {entry.valor >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{entry.descricao}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                className={`text-[10px] px-1.5 py-0 h-4 border ${TIPO_STYLES[entry.tipo]}`}
                              >
                                {TIPO_LABELS[entry.tipo]}
                              </Badge>
                              <span className="text-[10px] text-gray-400">
                                {format(new Date(entry.data), "HH:mm")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold tabular-nums shrink-0 ml-2 ${
                            entry.valor >= 0 ? "text-[#1D9E75]" : "text-red-600"
                          }`}
                        >
                          {entry.valor >= 0 ? "+" : ""}R${entry.valor.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
