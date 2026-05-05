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
import { Trash2, UserPlus, Users, Phone, CreditCard, X } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { nome: "", sobrenome: "", apelido: "", rg: "", telefone: "" };
type FormErrors = Partial<Record<keyof typeof EMPTY_FORM, string>>;

function getInitials(apelido: string, nome: string) {
  const src = apelido || nome;
  return src.slice(0, 2).toUpperCase();
}

// Deterministic color from string
const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-cyan-500", "bg-teal-500",
  "bg-[#1D9E75]", "bg-orange-500", "bg-pink-500", "bg-rose-500",
];
function avatarColor(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export default function Membros() {
  const { members, addMember, removeMember } = useApp();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null);

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="h-5 w-5" /> Membros
          {members.length > 0 && (
            <span className="text-sm font-normal text-gray-400">({members.length})</span>
          )}
        </h1>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#1D9E75] hover:bg-[#17856a]"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> Novo Membro
          </Button>
        )}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:text-red-600 hover:bg-red-50 h-8 w-8 shrink-0"
                    onClick={() =>
                      setPendingDelete({ id: m.id, label: m.apelido || m.nome })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
    </div>
  );
}
