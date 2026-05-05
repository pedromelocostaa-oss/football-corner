import { useState, useMemo } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Trophy,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Target,
  Medal,
  CalendarDays,
  UserPlus,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { GoalPlayer } from "@/types";

export default function Gols() {
  const { members, jogos, selectedMonth, addJogo, removeJogo } = useApp();

  // --- Tab: Registrar Jogo ---
  const [dataJogo, setDataJogo] = useState("");
  const [jogoAberto, setJogoAberto] = useState(false);
  const [jogadores, setJogadores] = useState<GoalPlayer[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [nomeAvulso, setNomeAvulso] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  // --- Tab: Gols do mês ---
  const [expandedJogoId, setExpandedJogoId] = useState<string | null>(null);

  const jogosMes = useMemo(
    () => jogos.filter((j) => j.monthKey === selectedMonth),
    [jogos, selectedMonth]
  );

  const monthLabel = format(parseISO(`${selectedMonth}-01`), "MMMM 'de' yyyy", {
    locale: ptBR,
  });

  // Metrics for the month
  const totalGolsMes = useMemo(
    () => jogosMes.reduce((acc, j) => acc + j.jogadores.reduce((a, p) => a + p.gols, 0), 0),
    [jogosMes]
  );

  const artilheiroMes = useMemo(() => {
    const map: Record<string, number> = {};
    jogosMes.forEach((j) =>
      j.jogadores.forEach((p) => {
        if (p.gols > 0) {
          map[p.nome] = (map[p.nome] || 0) + p.gols;
        }
      })
    );
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { nome: sorted[0][0], gols: sorted[0][1] } : null;
  }, [jogosMes]);

  // Ranking data for selected month
  const rankingMes = useMemo(() => {
    const map: Record<string, number> = {};
    jogosMes.forEach((j) =>
      j.jogadores.forEach((p) => {
        if (p.gols > 0) {
          map[p.nome] = (map[p.nome] || 0) + p.gols;
        }
      })
    );
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, gols]) => ({ nome, gols }));
  }, [jogosMes]);

  const maxGolsMes = rankingMes.length > 0 ? rankingMes[0].gols : 1;

  // Historical ranking (all months)
  const rankingHistorico = useMemo(() => {
    const map: Record<string, { gols: number; jogos: number }> = {};
    jogos.forEach((j) =>
      j.jogadores.forEach((p) => {
        if (!map[p.nome]) map[p.nome] = { gols: 0, jogos: 0 };
        map[p.nome].gols += p.gols;
        map[p.nome].jogos += 1;
      })
    );
    return Object.entries(map)
      .sort((a, b) => b[1].gols - a[1].gols)
      .map(([nome, data], i) => ({
        pos: i + 1,
        nome,
        gols: data.gols,
        jogos: data.jogos,
        media: data.jogos > 0 ? (data.gols / data.jogos).toFixed(2) : "0.00",
      }));
  }, [jogos]);

  // --- Registrar jogo helpers ---
  const handleCriarJogo = () => {
    if (!dataJogo.trim()) {
      toast.error("Informe a data do jogo.");
      return;
    }
    setJogoAberto(true);
    setJogadores([]);
  };

  const handleAddMember = () => {
    if (!selectedMemberId) return;
    const member = members.find((m) => m.id === selectedMemberId);
    if (!member) return;
    const nome = member.apelido || `${member.nome} ${member.sobrenome}`.trim();
    if (jogadores.some((j) => j.memberId === selectedMemberId)) {
      toast.error("Jogador já adicionado.");
      return;
    }
    setJogadores((prev) => [...prev, { nome, memberId: selectedMemberId, gols: 0 }]);
    setSelectedMemberId("");
  };

  const handleAddAvulso = () => {
    const name = nomeAvulso.trim();
    if (!name) return;
    if (jogadores.some((j) => j.nome.toLowerCase() === name.toLowerCase() && !j.memberId)) {
      toast.error("Jogador já adicionado.");
      return;
    }
    setJogadores((prev) => [...prev, { nome: name, gols: 0 }]);
    setNomeAvulso("");
  };

  const changeGols = (index: number, delta: number) => {
    setJogadores((prev) =>
      prev.map((j, i) =>
        i === index ? { ...j, gols: Math.max(0, j.gols + delta) } : j
      )
    );
  };

  const removeJogador = (index: number) => {
    setJogadores((prev) => prev.filter((_, i) => i !== index));
  };

  // Parse monthKey from data string "dd/MM/yyyy"
  function parseMonthKey(data: string): string {
    const parts = data.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}`;
    }
    return selectedMonth;
  }

  const handleSalvarJogo = () => {
    if (jogadores.length === 0) {
      toast.error("Adicione ao menos um jogador.");
      return;
    }
    const monthKey = parseMonthKey(dataJogo);
    addJogo({ data: dataJogo, monthKey, jogadores });
    toast.success("Jogo salvo com sucesso!");
    setJogoAberto(false);
    setDataJogo("");
    setJogadores([]);
  };

  const handleCancelarJogo = () => {
    setJogoAberto(false);
    setJogadores([]);
  };

  const membersNotInGame = members.filter(
    (m) => !jogadores.some((j) => j.memberId === m.id)
  );

  const medalColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];
  const medalEmojis = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-[#1D9E75]" /> Gols
      </h1>

      <Tabs defaultValue="gols">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="gols">Gols</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="registrar">Registrar jogo</TabsTrigger>
        </TabsList>

        {/* ===== TAB: GOLS ===== */}
        <TabsContent value="gols" className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Jogos</span>
                  <CalendarDays className="h-4 w-4 text-[#1D9E75]" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{jogosMes.length}</p>
                <p className="text-xs text-gray-400 mt-1 capitalize">{monthLabel}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total gols</span>
                  <Target className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{totalGolsMes}</p>
                <p className="text-xs text-gray-400 mt-1">no mês</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm col-span-2">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Artilheiro do mês</span>
                  <Medal className="h-4 w-4 text-yellow-500" />
                </div>
                {artilheiroMes ? (
                  <>
                    <p className="text-xl font-bold text-gray-800 truncate">{artilheiroMes.nome}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {artilheiroMes.gols} {artilheiroMes.gols === 1 ? "gol" : "gols"}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">Nenhum gol registrado</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Games list */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base capitalize">Jogos de {monthLabel}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {jogosMes.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Trophy className="h-10 w-10 text-gray-200 mx-auto" />
                  <p className="text-gray-400 text-sm">Nenhum jogo registrado neste mês.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...jogosMes]
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((jogo) => {
                      const totalGols = jogo.jogadores.reduce((s, p) => s + p.gols, 0);
                      const isOpen = expandedJogoId === jogo.id;
                      return (
                        <div key={jogo.id} className="border rounded-lg overflow-hidden">
                          <div
                            className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedJogoId(isOpen ? null : jogo.id)}
                          >
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">{jogo.data}</span>
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                {totalGols} {totalGols === 1 ? "gol" : "gols"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-300 hover:text-red-500 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPendingDelete(jogo.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                              {isOpen ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                          {isOpen && (
                            <div className="border-t bg-gray-50 px-3 py-2 space-y-1.5">
                              {jogo.jogadores.map((p, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700">{p.nome}</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-gray-600">
                                      {p.gols}
                                    </span>
                                    <span className="text-sm">
                                      {Array.from({ length: Math.min(p.gols, 8) }).map((_, k) => (
                                        <span key={k}>⚽</span>
                                      ))}
                                      {p.gols > 8 && <span className="text-xs text-gray-400">+{p.gols - 8}</span>}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB: RANKING ===== */}
        <TabsContent value="ranking" className="space-y-5">
          {/* Bar chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base capitalize">Artilharia de {monthLabel}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {rankingMes.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  Nenhum gol registrado neste mês.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {rankingMes.map((item, i) => (
                    <div key={item.nome} className="flex items-center gap-3">
                      <span className="text-base w-6 text-center">
                        {i < 3 ? medalEmojis[i] : <span className={`text-xs font-bold ${medalColors[i] ?? "text-gray-500"}`}>{i + 1}</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium truncate">{item.nome}</span>
                          <span className="text-sm font-bold text-[#1D9E75] ml-2 shrink-0">
                            {item.gols}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1D9E75] rounded-full transition-all"
                            style={{ width: `${(item.gols / maxGolsMes) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historical table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Artilharia histórica</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {rankingHistorico.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  Nenhum jogo registrado ainda.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-gray-400 uppercase">
                        <th className="pb-2 text-left w-8">#</th>
                        <th className="pb-2 text-left">Nome</th>
                        <th className="pb-2 text-right">Gols</th>
                        <th className="pb-2 text-right">Jogos</th>
                        <th className="pb-2 text-right">Média</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rankingHistorico.map((row) => (
                        <tr key={row.nome} className="hover:bg-gray-50">
                          <td className="py-2 text-gray-400 font-medium">
                            {row.pos <= 3 ? medalEmojis[row.pos - 1] : row.pos}
                          </td>
                          <td className="py-2 font-medium">{row.nome}</td>
                          <td className="py-2 text-right font-bold text-[#1D9E75]">{row.gols}</td>
                          <td className="py-2 text-right text-gray-500">{row.jogos}</td>
                          <td className="py-2 text-right text-gray-500">{row.media}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB: REGISTRAR ===== */}
        <TabsContent value="registrar" className="space-y-4">
          {!jogoAberto ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-sm">Data do jogo</Label>
                    <Input
                      value={dataJogo}
                      onChange={(e) => setDataJogo(e.target.value)}
                      placeholder="01/03/2026"
                    />
                  </div>
                  <Button
                    onClick={handleCriarJogo}
                    className="bg-[#1D9E75] hover:bg-[#17856a]"
                  >
                    <CalendarDays className="h-4 w-4 mr-1.5" /> Criar jogo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-[#1D9E75]/30 border-2 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#1D9E75]" />
                    Jogo de {dataJogo}
                  </CardTitle>
                  <Badge className="bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/30">
                    {jogadores.length} {jogadores.length === 1 ? "jogador" : "jogadores"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Add member */}
                <div className="space-y-2">
                  <Label className="text-sm">Adicionar membro do grupo</Label>
                  <div className="flex gap-2">
                    <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione um membro..." />
                      </SelectTrigger>
                      <SelectContent>
                        {membersNotInGame.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.apelido || `${m.nome} ${m.sobrenome}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddMember}
                      disabled={!selectedMemberId}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Add avulso */}
                <div className="space-y-2">
                  <Label className="text-sm">Adicionar jogador externo</Label>
                  <div className="flex gap-2">
                    <Input
                      value={nomeAvulso}
                      onChange={(e) => setNomeAvulso(e.target.value)}
                      placeholder="Nome do jogador avulso"
                      onKeyDown={(e) => e.key === "Enter" && handleAddAvulso()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddAvulso}
                      disabled={!nomeAvulso.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Players list */}
                {jogadores.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Gols por jogador</Label>
                    <div className="space-y-1.5">
                      {jogadores.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <span className="flex-1 text-sm font-medium truncate">{p.nome}</span>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => changeGols(i, -1)}
                              disabled={p.gols === 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-bold w-5 text-center">{p.gols}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => changeGols(i, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-300 hover:text-red-500 hover:bg-red-50"
                            onClick={() => removeJogador(i)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={handleSalvarJogo}
                    className="bg-[#1D9E75] hover:bg-[#17856a]"
                  >
                    <Save className="h-4 w-4 mr-1.5" /> Salvar jogo
                  </Button>
                  <Button variant="outline" onClick={handleCancelarJogo}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent games */}
          {jogos.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Jogos registrados</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {[...jogos]
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .slice(0, 10)
                    .map((jogo) => {
                      const totalGols = jogo.jogadores.reduce((s, p) => s + p.gols, 0);
                      return (
                        <div
                          key={jogo.id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <span className="text-sm text-gray-700">{jogo.data}</span>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              {totalGols} gols
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {jogo.jogadores.length} jogadores
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete jogo confirmation */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover este jogo?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os gols registrados neste jogo serão removidos. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (pendingDelete) {
                  removeJogo(pendingDelete);
                  toast.success("Jogo removido.");
                  setPendingDelete(null);
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
