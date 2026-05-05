import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Clock, Zap, Wallet } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { members, mensalidades, avulsos, selectedMonth, toggleMensalidade, saldoCaixa, getMensalidadeForMonth } =
    useApp();

  const pagos = members.filter((m) => getMensalidadeForMonth(m.id, selectedMonth)?.pago);
  const pendentes = members.filter((m) => !getMensalidadeForMonth(m.id, selectedMonth)?.pago);
  const avulsosMes = avulsos.filter((a) => a.monthKey === selectedMonth);

  const monthLabel = format(parseISO(`${selectedMonth}-01`), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold capitalize">Dashboard — {monthLabel}</h1>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Mensalistas Pagos</CardTitle>
            <CheckCircle className="h-4 w-4 text-[#1D9E75]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#1D9E75]">
              {pagos.length}/{members.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{pendentes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Avulsos</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">{avulsosMes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Saldo Caixa</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${saldoCaixa >= 0 ? "text-blue-600" : "text-red-600"}`}>
              R$ {saldoCaixa.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Membros — {monthLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum membro cadastrado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-semibold text-gray-600">Apelido</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-600 hidden sm:table-cell">Nome</th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-600">Status</th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-600">Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const payment = getMensalidadeForMonth(m.id, selectedMonth);
                    const pago = payment?.pago ?? false;
                    return (
                      <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-2 font-medium">{m.apelido}</td>
                        <td className="py-2 px-2 text-gray-600 hidden sm:table-cell">
                          {m.nome} {m.sobrenome}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {pago ? (
                            <Badge className="bg-[#1D9E75] text-white">Pago</Badge>
                          ) : (
                            <Badge variant="destructive">Pendente</Badge>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <Switch
                            checked={pago}
                            onCheckedChange={() => toggleMensalidade(m.id, selectedMonth)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Avulsos do mês */}
      {avulsosMes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Avulsos do mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {avulsosMes.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-1 border-b last:border-0">
                  <span className="font-medium">{a.nome}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">{a.dataJogo}</span>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">Avulso R$10</Badge>
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
