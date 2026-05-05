import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function Avulsos() {
  const { members, avulsos, selectedMonth, addAvulso, removeAvulso } = useApp();
  const [nome, setNome] = useState("");
  const [memberId, setMemberId] = useState("");
  const [dataJogo, setDataJogo] = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  const monthLabel = format(parseISO(`${selectedMonth}-01`), "MMMM 'de' yyyy", { locale: ptBR });
  const avulsosMes = avulsos.filter((a) => a.monthKey === selectedMonth);

  const handleMemberSelect = (id: string) => {
    setMemberId(id);
    if (id) {
      const m = members.find((m) => m.id === id);
      if (m) setNome(m.apelido || `${m.nome} ${m.sobrenome}`);
    } else {
      setNome("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe o nome do jogador.");
      return;
    }
    if (!dataJogo) {
      toast.error("Informe a data do jogo.");
      return;
    }
    addAvulso({ nome: nome.trim(), memberId: memberId || undefined, dataJogo });
    toast.success(`Avulso registrado: ${nome} — R$10 lançado no caixa.`);
    setNome("");
    setMemberId("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold capitalize">Avulsos — {monthLabel}</h1>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Registrar Avulso (R$10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Membro do grupo (opcional)</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  value={memberId}
                  onChange={(e) => handleMemberSelect(e.target.value)}
                >
                  <option value="">— Convidado externo —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.apelido} ({m.nome} {m.sobrenome})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Nome do jogador *</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome ou apelido"
                />
              </div>
              <div className="space-y-1">
                <Label>Data do jogo *</Label>
                <Input
                  type="date"
                  value={dataJogo}
                  onChange={(e) => setDataJogo(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
              Registrar Avulso — R$10
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Avulsos de {monthLabel} ({avulsosMes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {avulsosMes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum avulso neste mês.</p>
          ) : (
            <div className="space-y-2">
              {avulsosMes
                .sort((a, b) => b.dataJogo.localeCompare(a.dataJogo))
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50"
                  >
                    <div>
                      <p className="font-semibold">{a.nome}</p>
                      <p className="text-xs text-gray-500">{a.dataJogo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300">R$10</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        onClick={() => {
                          removeAvulso(a.id);
                          toast.success("Avulso removido.");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
