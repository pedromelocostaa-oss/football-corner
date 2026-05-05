import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, MinusCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const TIPO_LABELS: Record<string, string> = {
  mensalidade: "Mensalidade",
  avulso: "Avulso",
  despesa: "Despesa",
};

const TIPO_COLORS: Record<string, string> = {
  mensalidade: "bg-green-100 text-green-800",
  avulso: "bg-amber-100 text-amber-800",
  despesa: "bg-red-100 text-red-800",
};

export default function Caixa() {
  const { caixa, saldoCaixa, totalEntradas, totalSaidas, addDespesa } = useApp();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(valor.replace(",", "."));
    if (!descricao.trim()) {
      toast.error("Informe a descrição da despesa.");
      return;
    }
    if (isNaN(v) || v <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    addDespesa(descricao.trim(), v);
    toast.success(`Despesa registrada: ${descricao} — R$${v.toFixed(2)}`);
    setDescricao("");
    setValor("");
  };

  const extrato = [...caixa].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Caixa</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${saldoCaixa >= 0 ? "text-blue-600" : "text-red-600"}`}>
              R$ {saldoCaixa.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#1D9E75]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#1D9E75]">R$ {totalEntradas.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Total Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">R$ {totalSaidas.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Register expense */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MinusCircle className="h-5 w-5 text-red-500" /> Registrar Despesa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <Label>Descrição</Label>
              <Input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Bola Nike"
              />
            </div>
            <div className="w-full sm:w-36 space-y-1">
              <Label>Valor (R$)</Label>
              <Input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="100,00"
                inputMode="decimal"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="destructive">
                Debitar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Extrato */}
      <Card>
        <CardHeader>
          <CardTitle>Extrato Completo ({extrato.length} lançamentos)</CardTitle>
        </CardHeader>
        <CardContent>
          {extrato.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum lançamento ainda.</p>
          ) : (
            <div className="space-y-2">
              {extrato.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs ${TIPO_COLORS[entry.tipo]}`}>
                      {TIPO_LABELS[entry.tipo]}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{entry.descricao}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(entry.data), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold text-sm ${
                      entry.valor >= 0 ? "text-[#1D9E75]" : "text-red-600"
                    }`}
                  >
                    {entry.valor >= 0 ? "+" : ""}R$ {entry.valor.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
