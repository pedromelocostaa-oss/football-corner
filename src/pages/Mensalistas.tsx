import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CreditCard, UserPlus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function Mensalistas() {
  const { members, selectedMonth, toggleMensalidade, getMensalidadeForMonth } = useApp();
  const navigate = useNavigate();

  const monthLabel = format(parseISO(`${selectedMonth}-01`), "MMMM 'de' yyyy", { locale: ptBR });
  const pagos = members.filter((m) => getMensalidadeForMonth(m.id, selectedMonth)?.pago);
  const pendentes = members.filter((m) => !getMensalidadeForMonth(m.id, selectedMonth)?.pago);
  const progressPct = members.length > 0 ? (pagos.length / members.length) * 100 : 0;

  // Pendentes first for quick action
  const sortedMembers = [...pendentes, ...pagos];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold capitalize text-gray-800">
          Mensalistas — {monthLabel}
        </h1>
      </div>

      {/* Progress summary */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Progresso do mês
            </span>
            <span className="text-sm font-bold text-gray-800">
              {pagos.length}/{members.length} pagos
            </span>
          </div>
          <Progress
            value={progressPct}
            className="h-3 bg-gray-100 [&>div]:bg-[#1D9E75] [&>div]:transition-all [&>div]:duration-500"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span className="text-[#1D9E75] font-medium">
              R${(pagos.length * 20).toFixed(0)} arrecadados
            </span>
            {pendentes.length > 0 && (
              <span className="text-red-400">
                R${(pendentes.length * 20).toFixed(0)} pendentes
              </span>
            )}
            {pendentes.length === 0 && members.length > 0 && (
              <span className="text-[#1D9E75] font-semibold">🎉 Todos pagaram!</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" /> Mensalidades · R$20/mês
          </CardTitle>
          {members.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              Toque em um membro para marcar/desmarcar o pagamento
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {members.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <CreditCard className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="text-gray-400 text-sm">
                Nenhum membro cadastrado ainda.
              </p>
              <Button
                size="sm"
                className="bg-[#1D9E75] hover:bg-[#17856a]"
                onClick={() => navigate("/membros")}
              >
                <UserPlus className="h-4 w-4 mr-1" /> Cadastrar membros
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedMembers.map((m) => {
                const payment = getMensalidadeForMonth(m.id, selectedMonth);
                const pago = payment?.pago ?? false;
                return (
                  <div
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleMensalidade(m.id, selectedMonth)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && toggleMensalidade(m.id, selectedMonth)
                    }
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none
                      transition-all duration-150 active:scale-[0.99]
                      ${pago
                        ? "bg-green-50 border-green-200 hover:bg-green-100"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                          ${pago ? "bg-[#1D9E75] text-white" : "bg-gray-100 text-gray-500"}`}
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
                        {pago && payment?.paidAt && (
                          <p className="text-xs text-green-600 mt-0.5">
                            ✓ {format(new Date(payment.paidAt), "dd/MM/yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {pago ? (
                        <Badge className="bg-[#1D9E75] text-white text-xs hidden sm:inline-flex">
                          Pago
                        </Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-600 border border-red-200 text-xs hidden sm:inline-flex">
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
    </div>
  );
}
