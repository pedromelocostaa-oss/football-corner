import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, UserPlus, Users, Phone, CreditCard, X, Pencil, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Member } from "@/types";

const EMPTY_FORM = { nome: "", sobrenome: "", apelido: "", rg: "", telefone: "" };
type FormErrors = Partial<Record<keyof typeof EMPTY_FORM, string>>;

function getInitials(apelido: string, nome: string) {
  const src = apelido || nome;
  return src.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-cyan-500", "bg-teal-500",
  "bg-[#1D9E75]", "bg-orange-500", "bg-pink-500", "bg-rose-500",
];
function avatarColor(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

// ── Bulk upload types ──────────────────────────────────────────
type ParsedMember = {
  nome: string;
  sobrenome: string;
  apelido: string | null;
  rg: string | null;
  telefone: string | null;
};

// ── Edit modal ─────────────────────────────────────────────────
interface EditModalProps {
  member: Member | null;
  onClose: () => void;
  onSave: (id: string, data: Omit<Member, "id" | "createdAt">) => void;
}

function EditModal({ member, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState<Omit<Member, "id" | "createdAt">>({
    nome: member?.nome ?? "",
    sobrenome: member?.sobrenome ?? "",
    apelido: member?.apelido ?? "",
    rg: member?.rg ?? "",
    telefone: member?.telefone ?? "",
  });
  const [nomeError, setNomeError] = useState("");

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === "nome") setNomeError("");
  };

  const handleSave = () => {
    if (!form.nome.trim()) {
      setNomeError("Nome obrigatório.");
      return;
    }
    onSave(member!.id, form);
  };

  return (
    <Dialog open={!!member} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar membro</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.nome}
              onChange={set("nome")}
              className={nomeError ? "border-red-400" : ""}
              autoFocus
            />
            {nomeError && <p className="text-xs text-red-500">{nomeError}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Sobrenome</Label>
            <Input value={form.sobrenome} onChange={set("sobrenome")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Apelido</Label>
            <Input value={form.apelido} onChange={set("apelido")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Telefone</Label>
            <Input value={form.telefone} onChange={set("telefone")} inputMode="tel" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">RG</Label>
            <Input value={form.rg} onChange={set("rg")} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-[#1D9E75] hover:bg-[#17856a]">
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Bulk upload modal ──────────────────────────────────────────
interface BulkModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (list: Omit<Member, "id" | "createdAt">[]) => void;
}

type BulkStep = "input" | "loading" | "confirm";

function BulkModal({ open, onClose, onConfirm }: BulkModalProps) {
  const [step, setStep] = useState<BulkStep>("input");
  const [rawText, setRawText] = useState("");
  const [inputError, setInputError] = useState("");
  const [parsed, setParsed] = useState<ParsedMember[]>([]);
  const [editing, setEditing] = useState<ParsedMember[]>([]);

  const reset = () => {
    setStep("input");
    setRawText("");
    setInputError("");
    setParsed([]);
    setEditing([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) {
      setInputError("Cole a lista antes de analisar.");
      return;
    }
    setInputError("");
    setStep("loading");

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
    if (!apiKey) {
      toast.error("Chave da API não configurada (VITE_ANTHROPIC_API_KEY).");
      setStep("input");
      return;
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: `Você é um assistente que extrai dados de membros de um grupo de futebol a partir de texto livre.

O usuário vai colar uma lista em qualquer formato (tabela, texto corrido, WhatsApp, planilha copiada, etc).

Extraia todos os membros encontrados e retorne SOMENTE um JSON válido, sem nenhum texto antes ou depois, sem markdown, sem explicação.

O JSON deve ser um array de objetos com esta estrutura:
[
  {
    "nome": "string",
    "sobrenome": "string",
    "apelido": "string ou null se não encontrado",
    "rg": "string ou null se não encontrado",
    "telefone": "string ou null se não encontrado"
  }
]

Regras:
- Se o nome completo estiver junto, separe em nome e sobrenome (primeiro nome = nome, restante = sobrenome)
- Se não houver sobrenome, deixe sobrenome como string vazia
- Normalize telefones para o formato (XX) 9 XXXX-XXXX quando possível
- Ignore linhas que claramente não são membros (cabeçalhos, datas, totais)
- Se um campo não existir no texto, retorne null para ele
- Nunca invente dados que não estejam no texto`,
          messages: [{ role: "user", content: rawText }],
        }),
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const data = await res.json();
      const text = data?.content?.[0]?.text ?? "";

      let members: ParsedMember[];
      try {
        members = JSON.parse(text);
      } catch {
        toast.error("Não consegui interpretar a lista. Tente reformatar o texto e enviar novamente.");
        setStep("input");
        return;
      }

      if (!Array.isArray(members) || members.length === 0) {
        toast.error("Nenhum membro encontrado no texto. Verifique o formato e tente novamente.");
        setStep("input");
        return;
      }

      setParsed(members);
      setEditing(members.map((m) => ({ ...m })));
      setStep("confirm");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao chamar a API. Verifique sua conexão e tente novamente.");
      setStep("input");
    }
  };

  const setEditField = (
    i: number,
    field: keyof ParsedMember,
    value: string
  ) => {
    setEditing((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m))
    );
  };

  const handleConfirm = () => {
    const list: Omit<Member, "id" | "createdAt">[] = editing.map((m) => ({
      nome: m.nome ?? "",
      sobrenome: m.sobrenome ?? "",
      apelido: m.apelido ?? "",
      rg: m.rg ?? "",
      telefone: m.telefone ?? "",
    }));
    onConfirm(list);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-[#1D9E75]" /> Subir membros em massa
          </DialogTitle>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Cole abaixo a lista de membros em qualquer formato — pode ser tabela, lista, texto
              corrido ou colado direto do WhatsApp. A IA vai identificar os dados automaticamente.
            </p>
            <textarea
              className="w-full border rounded-md p-3 text-sm min-h-[180px] resize-y focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40 focus:border-[#1D9E75]"
              placeholder={"Pedro Costa (11) 99999-9999\nJoão Silva — apelido: Juninho\n1. Carlos Souza RG 12.345.678-9"}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (inputError) setInputError("");
              }}
            />
            {inputError && <p className="text-xs text-red-500">{inputError}</p>}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleAnalyze} className="bg-[#1D9E75] hover:bg-[#17856a]">
                Analisar lista
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#1D9E75]" />
            <p className="text-sm text-gray-500">Analisando sua lista...</p>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              <strong>{editing.length} {editing.length === 1 ? "membro identificado" : "membros identificados"}</strong>.
              Revise os dados antes de confirmar. Clique em qualquer campo para editar.
            </p>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Nome</th>
                    <th className="px-3 py-2 text-left">Sobrenome</th>
                    <th className="px-3 py-2 text-left">Apelido</th>
                    <th className="px-3 py-2 text-left">RG</th>
                    <th className="px-3 py-2 text-left">Telefone</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {editing.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {(["nome", "sobrenome", "apelido", "rg", "telefone"] as (keyof ParsedMember)[]).map(
                        (field) => (
                          <td key={field} className="px-2 py-1">
                            <input
                              className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-[#1D9E75]/40 rounded px-1 py-0.5 text-sm"
                              value={(m[field] as string) ?? ""}
                              onChange={(e) => setEditField(i, field, e.target.value)}
                            />
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("input")}>
                Voltar e corrigir
              </Button>
              <Button onClick={handleConfirm} className="bg-[#1D9E75] hover:bg-[#17856a]">
                Confirmar e cadastrar todos
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function Membros() {
  const { members, addMember, addMembers, removeMember, updateMember } = useApp();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showBulk, setShowBulk] = useState(false);

  const set = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.nome.trim()) errs.nome = "Nome obrigatório.";
    if (!form.sobrenome.trim()) errs.sobrenome = "Sobrenome obrigatório.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addMember(form);
    toast.success(`${form.apelido || form.nome} adicionado ao grupo!`);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleEditSave = (id: string, data: Omit<Member, "id" | "createdAt">) => {
    updateMember(id, data);
    const label = data.apelido || data.nome;
    toast.success(`Cadastro de ${label} atualizado.`);
    setEditingMember(null);
  };

  const handleBulkConfirm = (list: Omit<Member, "id" | "createdAt">[]) => {
    addMembers(list);
    toast.success(`${list.length} ${list.length === 1 ? "membro cadastrado" : "membros cadastrados"} com sucesso!`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="h-5 w-5" /> Membros
          {members.length > 0 && (
            <span className="text-sm font-normal text-gray-400">({members.length})</span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBulk(true)}
            className="text-[#1D9E75] border-[#1D9E75]/40 hover:bg-[#1D9E75]/5"
          >
            <Upload className="h-4 w-4 mr-1.5" /> Subir em massa
          </Button>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#1D9E75] hover:bg-[#17856a]"
            >
              <UserPlus className="h-4 w-4 mr-1.5" /> Novo Membro
            </Button>
          )}
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="border-[#1D9E75]/30 border-2 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[#1D9E75]" /> Cadastrar Novo Membro
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.nome}
                    onChange={set("nome")}
                    placeholder="Pedro"
                    className={errors.nome ? "border-red-400" : ""}
                    autoFocus
                  />
                  {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">
                    Sobrenome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.sobrenome}
                    onChange={set("sobrenome")}
                    placeholder="Costa"
                    className={errors.sobrenome ? "border-red-400" : ""}
                  />
                  {errors.sobrenome && (
                    <p className="text-xs text-red-500">{errors.sobrenome}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Apelido</Label>
                  <Input
                    value={form.apelido}
                    onChange={set("apelido")}
                    placeholder="Pedrão"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Telefone</Label>
                  <Input
                    value={form.telefone}
                    onChange={set("telefone")}
                    placeholder="(11) 99999-9999"
                    inputMode="tel"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">RG</Label>
                  <Input
                    value={form.rg}
                    onChange={set("rg")}
                    placeholder="12.345.678-9"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" className="bg-[#1D9E75] hover:bg-[#17856a]">
                  Salvar membro
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Lista de Membros</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {members.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Users className="h-12 w-12 text-gray-200 mx-auto" />
              <div>
                <p className="text-gray-400 text-sm font-medium">Nenhum membro ainda</p>
                <p className="text-gray-300 text-xs mt-0.5">
                  Adicione os caras do grupo para controlar as mensalidades
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#1D9E75] hover:bg-[#17856a]"
                onClick={() => setShowForm(true)}
              >
                <UserPlus className="h-4 w-4 mr-1" /> Cadastrar primeiro membro
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg -mx-1 px-1 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${avatarColor(m.id)}`}
                    >
                      {getInitials(m.apelido, m.nome)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">
                        {m.apelido ? (
                          <>
                            {m.apelido}{" "}
                            <span className="text-gray-400 font-normal">
                              — {m.nome} {m.sobrenome}
                            </span>
                          </>
                        ) : (
                          `${m.nome} ${m.sobrenome}`
                        )}
                      </p>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {m.telefone && (
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <Phone className="h-3 w-3" /> {m.telefone}
                          </span>
                        )}
                        {m.rg && (
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <CreditCard className="h-3 w-3" /> {m.rg}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-300 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 shrink-0"
                      onClick={() => setEditingMember(m)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-300 hover:text-red-600 hover:bg-red-50 h-8 w-8 shrink-0"
                      onClick={() =>
                        setPendingDelete({ id: m.id, label: m.apelido || m.nome })
                      }
                      title="Remover"
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

      {/* Delete confirmation */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover "{pendingDelete?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>
              O histórico de mensalidades deste membro será mantido, mas ele não
              aparecerá mais nas listas. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (pendingDelete) {
                  removeMember(pendingDelete.id);
                  toast.success(`${pendingDelete.label} removido.`);
                  setPendingDelete(null);
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit modal */}
      <EditModal
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSave={handleEditSave}
      />

      {/* Bulk upload modal */}
      <BulkModal
        open={showBulk}
        onClose={() => setShowBulk(false)}
        onConfirm={handleBulkConfirm}
      />
    </div>
  );
}
