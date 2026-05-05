import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, Clock, Zap, Wallet, UserPlus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const {
    members,
    avulsos,
    selectedMonth,
    toggleMensalidade,
    saldoCaixa,
    getMensalidadeForMonth,
  } = useApp();
  const navigate = useNavigate();

  const pagos = members.filter((m) => getMensalidadeForMonth(m.id, selectedMonth)?.pago);
  const pendentes = members.filter((m) => !getMensalidadeForMonth(m.id, selectedMonth)?.pago);
  const avulsosMes = avulsos.filter((a) => a.monthKey === selectedMonth);
  const progressPct = members.length > 0 ? (pagos.length / members.length) * 100 : 0;

  const monthLabel = format(parseISO(`${selectedMonth}-01`), "MMMM 'de' yyyy", { locale: ptBR });

  // Pendentes first, then pagos
  const sortedMembers = [
    ...members.filter((m) => !getMensalidadeForMonth(m.id, selectedMonth)?.pago),
    ...members.filter((m) => getMensalidadeForMonth(m.id, selectedMonth)?.pago),
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold capitalize text-gray-800">
        Dashboard — {monthLabel}
      </h1>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pagos</span>
              <CheckCircle className="h-4 w-4 text-[#1D9E75]" />
            </div>
            <p className="text-2xl font-bold text-[#1D9E75]">
              {pagos.length}
              <span className="text-base font-normal text-gray-400">/{members.length}</span>
            </p>
            <Progress
              value={progressPct}
              className="h-1.5 mt-2 bg-gray-100 [&>div]:bg-[#1D9E75]"
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pendentes</span>
              <Clock className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-500">{pendentes.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {pendentes.length === 0 ? "Todos pagaram! 🎉" : `R$${(pendentes.length * 20).toFixed(0)} a receber`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avulsos</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-500">{avulsosMes.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              R${(avulsosMes.length * 10).toFixed(0)} arrecadados
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-blue-200 uppercase tracking-wide">Caixa</span>
              <Wallet className="h-4 w-4 text-blue-200" />
            </div>
            <p className={`text-2xl font-bold ${saldoCaixa < 0 ? "text-red-300" : "text-white"}`}>
              R${saldoCaixa.toFixed(2)}
            </p>
            <p className="text-xs text-blue-200 mt-1">saldo atual</p>
          </CardContent>
        </Card>
      </div>

      {/* Members table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> Membros — {monthLabel}
            </CardTitle>
            {members.length === 0 && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => navigate("/membros")}
              >
                <UserPlus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {members.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Users className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="text-gray-400 text-sm">Nenhum membro cadastrado ainda.</p>
              <Button
                size="sm"
                className="bg-[#1D9E75] hover:bg-[#17856a]"
                onClick={() => navigate("/membros")}
              >
                <UserPlus className="h-4 w-4 mr-1" /> Cadastrar primeiro membro
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {sortedMembers.map((m) => {
                const payment = getMensalidadeForMonth(m.id, selectedMonth);
                const pago = payment?.pago ?? false;
                return (
                  <div
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleMensalidade(m.id, selectedMonth)}
                    onKeyDown={(e) => e.key === "Enter" && toggleMensalidade(m.id, selectedMonth)}
                    className={`flex items-center justify-between py-3 px-1 cursor-pointer select-none
                      rounded-lg transition-colors hover:bg-gray-50 active:bg-gray-100 -mx-1
                      ${pago ? "" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                          ${pago ? "bg-[#1D9E75]/15 text-[#1D9E75]" : "bg-red-100 text-red-600"}`}
                      >
                        {(m.apelido || m.nome).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">
                          {m.apelido || m.nome}
                        </p>
                        <p className="text-xs text-gray-400">
                          {m.nome} {m.sobrenome}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {pago ? (
                        <Badge className="bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/30 text-xs hidden sm:inline-flex">
                          Pago
                        </Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-600 border-red-200 text-xs hidden sm:inline-flex">
                          Pendente
                        </Badge>
                      )}
                      <Switch
                        checked={pago}
                        onCheckedChange={() => toggleMensalidade(m.id, selectedMonth)}
                        className="data-[state=checked]:bg-[#1D9E75]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Avulsos do mês */}
      {avulsosMes.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-amber-500" /> Avulsos do mês
              </CardTitle>
              <span className="text-xs text-gray-400">
                {avulsosMes.length} {avulsosMes.length === 1 ? "jogo" : "jogos"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {avulsosMes
                .sort((a, b) => b.dataJogo.localeCompare(a.dataJogo))
                .map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
                        {a.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium">{a.nome}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {format(new Date(a.dataJogo + "T12:00:00"), "dd/MM", { locale: ptBR })}
                      </span>
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                        R$10
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
