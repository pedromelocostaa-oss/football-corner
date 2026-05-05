export interface Member {
  id: string;
  nome: string;
  sobrenome: string;
  apelido: string;
  rg: string;
  telefone: string;
  createdAt: string;
}

export interface MensalidadePayment {
  id: string;
  memberId: string;
  monthKey: string; // "YYYY-MM"
  pago: boolean;
  paidAt?: string;
  caixaEntryId?: string;
}

export interface Avulso {
  id: string;
  nome: string;
  memberId?: string;
  dataJogo: string; // ISO date
  monthKey: string; // "YYYY-MM"
  caixaEntryId?: string;
}

export interface CaixaEntry {
  id: string;
  descricao: string;
  valor: number; // positive = entrada, negative = saída
  tipo: "mensalidade" | "avulso" | "despesa";
  data: string; // ISO date
  referencia?: string;
}
