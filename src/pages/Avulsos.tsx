import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Zap } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function Avulsos() {
  const { members, avulsos, selectedMonth, addAvulso, removeAvulso } = useApp();
  const [nome, setNome] = useState("");
  const [memberId, setMemberId] = useState("__externo__");
  const [dataJogo, setDataJogo] = useState(() => new Date().toISOString().slice(0, 10));
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const monthLabel = format(parseISO(`${selectedMonth}-01`), "MMMM 'de' yyyy", {
    locale: ptBR,
  });
  const avulsosMes = avulsos.filter((a) => a.monthKey === selectedMonth);

  const handleMemberSelect = (id: string) => {
    setMemberId(id);
    if (id !== "__externo__") {
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
    addAvulso({
      nome: nome.trim(),
      memberId: memberId !== "__externo__" ? memberId : undefined,
      dataJogo,
    });
    toast.success(`Avulso registrado! R$10 lançado no caixa.`);
    setNome("");
    setMemberId("__externo__");
  };

  const confirmRemove = (id: string) => setPendingDelete(id);

  const doRemove = () => {
    if (!pendingDelete) return;
    removeAvulso(pendingDelete);
    toast.success("Avulso removido.");
    setPendingDelete(null);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold capitalize text-gray-800">
        Avulsos — {monthLabel}
      </h1>

      {/* Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-amber-500" /> Registrar Avulso
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Quem jogou?</Label>
                <Select value={memberId} onValueChange={handleMemberSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar membro ou convidado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__externo__">
                      <span className="text-gray-500">— Convidado externo —</span>
                    </SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.apelido || m.nome} ({m.nome} {m.sobrenome})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">
                  Nome / apelido{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome ou apelido"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">
                  Data do jogo <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={dataJogo}
                  onChange={(e) => setDataJogo(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto">
              <Zap className="h-4 w-4 mr-1.5" /> Registrar — R$10
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Avulsos de {monthLabel}
            </CardTitle>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              {avulsosMes.length} {avulsosMes.length === 1 ? "jogo" : "jogos"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {avulsosMes.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Zap className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="text-gray-400 text-sm">Nenhum avulso neste mês.</p>
              <p className="text-gray-300 text-xs">Use o formulário acima para registrar.</p>
            </div>
          ) : (
            <div className="divide-y">
              {avulsosMes
                .sort((a, b) => b.dataJogo.localeCompare(a.dataJogo))
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
                        {a.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{a.nome}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(a.dataJogo + "T12:00:00"), "EEEE, dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                        R$10
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                        onClick={() => confirmRemove(a.id)}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover avulso?</AlertDialogTitle>
            <AlertDialogDescription>
              O lançamento de R$10 no caixa será revertido. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={doRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
