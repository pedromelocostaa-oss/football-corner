import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Zap,
  Wallet,
  Copy,
  Check,
} from "lucide-react";
import { format, addMonths, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
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
  const [copied, setCopied] = useState(false);

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
  const progressPct = members.length > 0 ? (pagos.length / members.length) * 100 : 0;

  const prev = () => setSelectedMonth(format(subMonths(current, 1), "yyyy-MM"));
  const next = () => setSelectedMonth(format(addMonths(current, 1), "yyyy-MM"));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copiado! Cola no grupo do WhatsApp 📲");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1D9E75] text-white shadow-md">
        <div className="max-w-lg mx-auto px-4 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-3xl leading-none">⚽</span>
            <span className="text-2xl font-black">Futebol dos Cria</span>
          </div>
          <p className="text-xs text-green-200 mb-3">Toda segunda às 20h</p>
          <Button
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="bg-white/15 border-white/30 text-white hover:bg-white/25 hover:text-white text-xs h-8 gap-1.5"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Link copiado!" : "Copiar link para o grupo"}
          </Button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Month selector */}
        <div className="flex items-center justify-center gap-2 py-1">
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            className="h-9 w-9 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-base font-bold capitalize min-w-[190px] text-center text-gray-800">
            {monthLabel}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={next}
            className="h-9 w-9 shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Saldo */}
        <Card
          className={`border-0 shadow-md text-white ${
            saldo >= 0
              ? "bg-gradient-to-br from-blue-600 to-blue-700"
              : "bg-gradient-to-br from-red-600 to-red-700"
          }`}
        >
          <CardContent className="pt-5 pb-5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Wallet className="h-4 w-4 text-blue-200" />
              <span className="text-sm text-blue-200 font-medium">Saldo do Caixa</span>
            </div>
            <p className="text-4xl font-black">R$ {saldo.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* Progress */}
        {members.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-medium text-gray-700">Mensalidades</span>
                <span className="font-bold text-gray-800">
                  {pagos.length}/{members.length}
                </span>
              </div>
              <Progress
                value={progressPct}
                className="h-3 bg-gray-100 [&>div]:bg-[#1D9E75] [&>div]:transition-all [&>div]:duration-700"
              />
              {pendentes.length === 0 && (
                <p className="text-center text-sm text-[#1D9E75] font-semibold mt-2">
                  🎉 Todos pagaram esse mês!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 text-center">
              <CheckCircle className="h-5 w-5 text-[#1D9E75] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#1D9E75]">{pagos.length}</p>
              <p className="text-xs text-gray-400">Pagos</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 text-center">
              <Clock className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-500">{pendentes.length}</p>
              <p className="text-xs text-gray-400">Pendentes</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 text-center">
              <Zap className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-500">{avulsosMes.length}</p>
              <p className="text-xs text-gray-400">Avulsos</p>
            </CardContent>
          </Card>
        </div>

        {/* Pagos */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-[#1D9E75]">
              <CheckCircle className="h-4 w-4" /> Pagos ({pagos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {pagos.length === 0 ? (
              <p className="text-gray-300 text-sm text-center py-3">
                Nenhum pagamento registrado ainda.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {pagos.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-1.5 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full px-3 py-1.5"
                  >
                    <div className="h-5 w-5 rounded-full bg-[#1D9E75] flex items-center justify-center text-[9px] font-bold text-white">
                      {(m.apelido || m.nome).slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold">{m.apelido || m.nome}</span>
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pendentes */}
        {pendentes.length > 0 && (
          <Card className="border-0 shadow-sm border-red-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-red-600">
                <Clock className="h-4 w-4" /> Pendentes ({pendentes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {pendentes.map((m) => (
                  <Badge
                    key={m.id}
                    variant="destructive"
                    className="text-sm px-3 py-1.5 rounded-full"
                  >
                    {m.apelido || m.nome}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Avulsos */}
        {avulsosMes.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-amber-600">
                <Zap className="h-4 w-4" /> Avulsos do mês ({avulsosMes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {avulsosMes
                  .sort((a, b) => b.dataJogo.localeCompare(a.dataJogo))
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-amber-200 flex items-center justify-center text-[9px] font-bold text-amber-800">
                          {a.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-amber-900">{a.nome}</span>
                      </div>
                      <span className="text-xs text-amber-600">
                        {format(new Date(a.dataJogo + "T12:00:00"), "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-gray-300 pb-4">
          Futebol dos Cria · toda segunda às 20h ⚽
        </p>
      </div>
    </div>
  );
}
