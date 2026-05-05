import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Mensalistas() {
  const { members, selectedMonth, toggleMensalidade, getMensalidadeForMonth } = useApp();
  const monthLabel = format(parseISO(`${selectedMonth}-01`), "MMMM 'de' yyyy", { locale: ptBR });
  const pagos = members.filter((m) => getMensalidadeForMonth(m.id, selectedMonth)?.pago).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold capitalize">Mensalistas — {monthLabel}</h1>
        <span className="text-sm text-gray-500">
          {pagos}/{members.length} pagos
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controle de Mensalidades (R$20/mês)</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              Nenhum membro cadastrado. Adicione membros na aba "Membros".
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => {
                const payment = getMensalidadeForMonth(m.id, selectedMonth);
                const pago = payment?.pago ?? false;
                return (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      pago ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{m.apelido}</p>
                      <p className="text-sm text-gray-500">
                        {m.nome} {m.sobrenome}
                      </p>
                      {pago && payment?.paidAt && (
                        <p className="text-xs text-green-600 mt-0.5">
                          Pago em {format(new Date(payment.paidAt), "dd/MM/yyyy HH:mm")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {pago ? (
                        <Badge className="bg-[#1D9E75] text-white">Pago</Badge>
                      ) : (
                        <Badge variant="destructive">Pendente</Badge>
                      )}
                      <Switch
                        checked={pago}
                        onCheckedChange={() => toggleMensalidade(m.id, selectedMonth)}
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
