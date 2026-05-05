import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { nome: "", sobrenome: "", apelido: "", rg: "", telefone: "" };

export default function Membros() {
  const { members, addMember, removeMember } = useApp();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const set = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.sobrenome.trim()) {
      toast.error("Nome e sobrenome são obrigatórios.");
      return;
    }
    addMember(form);
    toast.success(`Membro ${form.nome} adicionado!`);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleRemove = (id: string, nome: string) => {
    if (confirm(`Remover "${nome}"? Esta ação não pode ser desfeita.`)) {
      removeMember(id);
      toast.success(`Membro removido.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" /> Membros ({members.length})
        </h1>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-[#1D9E75] hover:bg-[#17856a]"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          {showForm ? "Cancelar" : "Novo Membro"}
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Membro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Nome *</Label>
                  <Input value={form.nome} onChange={set("nome")} placeholder="Pedro" />
                </div>
                <div className="space-y-1">
                  <Label>Sobrenome *</Label>
                  <Input value={form.sobrenome} onChange={set("sobrenome")} placeholder="Costa" />
                </div>
                <div className="space-y-1">
                  <Label>Apelido</Label>
                  <Input value={form.apelido} onChange={set("apelido")} placeholder="Pedrão" />
                </div>
                <div className="space-y-1">
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={set("telefone")} placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-1">
                  <Label>RG</Label>
                  <Input value={form.rg} onChange={set("rg")} placeholder="12.345.678-9" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#1D9E75] hover:bg-[#17856a]">
                  Salvar
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Membros</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              Nenhum membro cadastrado. Clique em "Novo Membro" para adicionar.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold">
                      {m.apelido ? `${m.apelido} — ` : ""}
                      {m.nome} {m.sobrenome}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-0.5">
                      {m.telefone && (
                        <span className="text-xs text-gray-400">📱 {m.telefone}</span>
                      )}
                      {m.rg && <span className="text-xs text-gray-400">RG: {m.rg}</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                    onClick={() => handleRemove(m.id, m.apelido || m.nome)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
