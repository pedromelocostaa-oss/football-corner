import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Zap, Wallet } from "lucide-react";
import { format, addMonths, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Member, MensalidadePayment, Avulso } from "@/types";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

export default function Publico() {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    format(new Date(), "yyyy-MM")
  );

  const members: Member[] = loadFromStorage("fdc_members", []);
  const mensalidades: MensalidadePayment[] = loadFromStorage("fdc_mensalidades", []);
  const avulsos: Avulso[] = loadFromStorage("fdc_avulsos", []);
  const caixaEntries: Array<{ valor: number }> = loadFromStorage("fdc_caixa", []);

  const current = parseISO(`${selectedMonth}-01`);
  const monthLabel = format(current, "MMMM 'de' yyyy", { locale: ptBR });

  const getMensalidade = (memberId: string) =>
    mensalidades.find((m) => m.memberId === memberId && m.monthKey === selectedMonth);

  const pagos = members.filter((m) => getMensalidade(m.id)?.pago);
  const pendentes = members.filter((m) => !getMensalidade(m.id)?.pago);
  const avulsosMes = avulsos.filter((a) => a.monthKey === selectedMonth);
  const saldo = caixaEntries.reduce((acc, e) => acc + e.valor, 0);

  const prev = () => setSelectedMonth(format(subMonths(current, 1), "yyyy-MM"));
  const next = () => setSelectedMonth(format(addMonths(current, 1), "yyyy-MM"));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1D9E75] text-white shadow">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-3xl">⚽</span>
            <span className="text-2xl font-bold">Futebol dos Cria</span>
          </div>
          <p className="text-sm text-green-100">Visão Pública — somente leitura</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Month selector */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" onClick={prev} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-bold capitalize min-w-[200px] text-center">{monthLabel}</span>
          <Button variant="outline" size="icon" onClick={next} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Saldo */}
        <Card className="border-blue-200">
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Wallet className="h-5 w-5 text-blue-600" />
              <span className="text-gray-500 font-medium">Saldo do Caixa</span>
            </div>
            <p className={`text-4xl font-bold ${saldo >= 0 ? "text-blue-600" : "text-red-600"}`}>
              R$ {saldo.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <CheckCircle className="h-5 w-5 text-[#1D9E75] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#1D9E75]">{pagos.length}</p>
              <p className="text-xs text-gray-500">Pagos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Clock className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-500">{pendentes.length}</p>
              <p className="text-xs text-gray-500">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Zap className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-500">{avulsosMes.length}</p>
              <p className="text-xs text-gray-500">Avulsos</p>
            </CardContent>
          </Card>
        </div>

        {/* Pagos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1D9E75]">
              <CheckCircle className="h-5 w-5" /> Pagos ({pagos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pagos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Nenhum pagamento ainda.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {pagos.map((m) => (
                  <Badge key={m.id} className="bg-[#1D9E75] text-white text-sm px-3 py-1">
                    {m.apelido || m.nome}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Clock className="h-5 w-5" /> Pendentes ({pendentes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendentes.length === 0 ? (
              <p className="text-[#1D9E75] text-sm text-center py-4 font-medium">
                🎉 Todos pagaram!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {pendentes.map((m) => (
                  <Badge key={m.id} variant="destructive" className="text-sm px-3 py-1">
                    {m.apelido || m.nome}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Avulsos */}
        {avulsosMes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Zap className="h-5 w-5" /> Avulsos do mês ({avulsosMes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {avulsosMes.map((a) => (
                  <Badge key={a.id} className="bg-amber-100 text-amber-800 border-amber-300 text-sm px-3 py-1">
                    {a.nome} · {a.dataJogo}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          Futebol dos Cria · toda segunda às 20h ⚽
        </p>
      </div>
    </div>
  );
}
