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

export interface GoalPlayer {
  nome: string;
  memberId?: string; // undefined = jogador avulso externo
  gols: number;
}

export interface Jogo {
  id: string;
  data: string; // ex: "01/03/2026"
  monthKey: string; // "YYYY-MM"
  jogadores: GoalPlayer[];
  createdAt: string;
}
